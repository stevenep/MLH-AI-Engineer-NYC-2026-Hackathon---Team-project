
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from nimble_python import Nimble

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
ENV_PATH = PROJECT_ROOT / "AI-Agent" / ".env"


def to_dict(result):
    """Convert Nimble's response into a Python object."""

    if hasattr(result, "model_dump"):
        return result.model_dump(mode="json")

    if hasattr(result, "to_dict"):
        return result.to_dict()

    return result


def walmart_search(nimble, product, zipcode="10001"):
    """Search Walmart using Nimble's Walmart template."""

    response = nimble.extract.templates.run(
        template="walmart_serp",
        params={
            "keyword": product,
            "page": 1,
            "zipcode": zipcode
        }
    )

    return to_dict(response)


def search_grocery_list(nimble, items, zipcode="10001"):
    """Search Walmart for every grocery item."""

    results = {}

    for item in items:
        print(f"Searching Walmart for: {item}", flush=True)

        try:
            results[item] = walmart_search(nimble, item, zipcode)

        except Exception as error:
            results[item] = {
                "error": str(error)
            }

    return {
        "store": "Walmart",
        "zipcode": zipcode,
        "results": results
    }


def extract_products(response):
    """Extract relevant product data from Nimble's response."""

    products = (
        response.get("data", {}).get("parsing") or []
    )

    cleaned = []

    for product in products:
        if not isinstance(product, dict):
            continue

        price = product.get("product_price")

        # Ignore products without prices
        if price is None:
            continue

        cleaned.append({
            "product_name": product.get("product_name"),
            "price": price,
            "availability": product.get(
                "product_availability"
            ),
            "seller": product.get("product_seller"),
            "store_location": product.get(
                "store_location"
            ),
            "url": product.get("product_url"),
            "image": product.get("product_image"),
            "sponsored": product.get("sponsored", False)
        })

    return cleaned


def save_json(filename, data):
    """Save JSON inside the Walmart folder."""

    output_path = BASE_DIR / filename

    with open(output_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, default=str)

    print(f"Saved: {output_path}")


if __name__ == "__main__":
    load_dotenv(ENV_PATH)
    api_key = os.getenv("NIMBLE_API_KEY")

    if not api_key:
        raise RuntimeError(
            "NIMBLE_API_KEY is missing from AI-Agent/.env"
        )

    nimble = Nimble(api_key=api_key)
    groceries = ["banana"]
    zipcode = "10001"
    output = search_grocery_list(nimble, groceries, zipcode)

    # Save complete API response
    save_json("walmart_results.json", output)

    clean_results = {}

    print("\n========== WALMART SUMMARY ==========")

    for item, response in output["results"].items():

        print(f"\nSearching for: {item}")

        if "error" in response:
            print("Error:", response["error"])
            clean_results[item] = []
            continue

        products = extract_products(response)

        clean_results[item] = products

        print(f"Found {len(products)} products with prices.")

        # Display only the first 10 products
        for product in products[:10]:
            print(
                f"{product['product_name']} | "
                f"${product['price']:.2f} | "
                f"{product['seller']}"
            )

    # Save simplified JSON
    clean_output = {
        "store": "Walmart",
        "zipcode": zipcode,
        "results": clean_results
    }

    save_json("walmart_clean.json", clean_output)

    print("\nWalmart extraction complete!")
  