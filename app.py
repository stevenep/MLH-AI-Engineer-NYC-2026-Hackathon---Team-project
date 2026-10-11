import os
import re

from flask import Flask, jsonify, request
from groceries_data import find_grocery_stores
from nimble_python import Nimble
from aldi_prices_ana import find_aldi_prices
from Walmart.walmart_prices import (
    extract_products as extract_walmart_products,
    search_grocery_list as search_walmart_grocery_list,
)

app = Flask(__name__)


def _read_product_items(data):
    if not isinstance(data, dict):
        return None, (jsonify({"error": "Send a JSON object."}), 400)

    items = data.get("items")
    if (
        not isinstance(items, list)
        or not 1 <= len(items) <= 5
        or any(
            not isinstance(item, str) or not item.strip()
            for item in items
        )
    ):
        return None, (
            jsonify({
                "error": "Enter between 1 and 5 grocery item names."
            }),
            400,
        )

    return [item.strip() for item in items], None


def _create_nimble_client():
    api_key = os.environ.get("NIMBLE_API_KEY", "").strip()
    if not api_key:
        return None, (
            jsonify({"error": "Backend API key is missing."}),
            500,
        )

    try:
        return Nimble(api_key=api_key), None
    except Exception:
        app.logger.exception("Nimble client initialization failed")
        return None, (
            jsonify({"error": "Could not initialize the Nimble client."}),
            502,
        )


@app.post("/api/groceries")
def groceries():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Send a JSON object."}), 400

    address = data.get("address")

    if not isinstance(address, str) or not address.strip():
        return jsonify({"error": "An address is required."}), 400

    radius = data.get("radius", 5)

    if isinstance(radius, bool) or radius not in (1, 3, 5, 10):
        return jsonify({"error": "Radius must be 1, 3, 5, or 10 miles."}), 400

    api_key = os.environ.get("NIMBLE_API_KEY")

    if not api_key:
        return jsonify({"error": "Backend API key is missing."}), 500

    try:
        stores = find_grocery_stores(address.strip(), api_key, radius)

        return jsonify({
            "stores": stores,
            "count": len(stores),
            "radius_miles": radius,
        })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception:
        app.logger.exception("Grocery lookup failed")
        return jsonify({"error": "Grocery lookup failed."}), 502

@app.post("/api/grocery-plan")
def grocery_plan():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Send a JSON object."}), 400

    address = data.get("address")
    items = data.get("items")

    if not isinstance(address, str) or not address.strip():
        return jsonify({"error": "Enter an address."}), 400

    if (
        not isinstance(items, list)
        or not 1 <= len(items) <= 5
        or any(
            not isinstance(item, str) or not item.strip()
            for item in items
        )
    ):
        return jsonify({
            "error": "Enter between 1 and 5 grocery items."
        }), 400

    api_key = os.environ.get("NIMBLE_API_KEY")

    if not api_key:
        return jsonify({"error": "Backend API key is missing."}), 500

    try:
        nearby_stores = find_grocery_stores(
            address.strip(), api_key
        )

        nimble = Nimble(api_key=api_key)

        aldi_items = find_aldi_prices(
            nimble,
            [item.strip() for item in items],
        )

        return jsonify({
            "nearby_stores": nearby_stores,
            "aldi_items": aldi_items,
        })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception:
        app.logger.exception("Grocery plan failed")
        return jsonify({"error": "Grocery lookup failed."}), 502


@app.post("/api/aldi-prices")
def aldi_prices():
    items, error_response = _read_product_items(
        request.get_json(silent=True)
    )
    if error_response:
        return error_response

    nimble, error_response = _create_nimble_client()
    if error_response:
        return error_response

    try:
        results = find_aldi_prices(
            nimble,
            items,
        )

        return jsonify({
            "store": "ALDI",
            "aldi_items": results,
        })

    except Exception:
        app.logger.exception("ALDI price lookup failed")
        return jsonify({"error": "ALDI price lookup failed."}), 502


@app.post("/api/walmart-prices")
def walmart_prices():
    data = request.get_json(silent=True)
    items, error_response = _read_product_items(data)
    if error_response:
        return error_response

    zipcode = data.get("zipcode", "10001").strip() if isinstance(
        data.get("zipcode", "10001"), str
    ) else ""
    if not re.fullmatch(r"\d{5}", zipcode):
        return jsonify({"error": "ZIP code must contain 5 digits."}), 400

    nimble, error_response = _create_nimble_client()
    if error_response:
        return error_response

    try:
        unique_items = list(dict.fromkeys(items))
        raw_results = search_walmart_grocery_list(
            nimble,
            unique_items,
            zipcode,
        )
        results = {}

        for item, response in raw_results["results"].items():
            if isinstance(response, dict) and "error" in response:
                results[item] = {
                    "products": [],
                    "error": response["error"],
                }
            else:
                results[item] = {
                    "products": extract_walmart_products(response),
                    "error": None,
                }

        return jsonify({
            "store": "Walmart",
            "zipcode": zipcode,
            "results": results,
        })

    except Exception:
        app.logger.exception("Walmart price lookup failed")
        return jsonify({"error": "Walmart price lookup failed."}), 502


if __name__ == "__main__":
    app.run(port=5000)