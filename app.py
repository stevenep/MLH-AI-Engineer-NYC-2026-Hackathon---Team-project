import os

from flask import Flask, jsonify, request
from groceries_data import find_grocery_stores

app = Flask(__name__)


@app.post("/api/groceries")
def groceries():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Send a JSON object."}), 400

    address = data.get("address")

    if not isinstance(address, str) or not address.strip():
        return jsonify({"error": "An address is required."}), 400

    api_key = os.environ.get("NIMBLE_API_KEY")

    if not api_key:
        return jsonify({"error": "Backend API key is missing."}), 500

    try:
        stores = find_grocery_stores(address.strip(), api_key)

        return jsonify({
            "stores": stores,
            "count": len(stores),
        })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    except Exception:
        app.logger.exception("Grocery lookup failed")
        return jsonify({"error": "Grocery lookup failed."}), 502


if __name__ == "__main__":
    app.run(port=5000)