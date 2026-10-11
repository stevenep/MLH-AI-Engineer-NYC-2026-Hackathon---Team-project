
import json
from pathlib import Path

# ==========================================
# 1. FILE PATHS
# ==========================================

# Locate the Walmart folder automatically
BASE_DIR = Path(__file__).resolve().parent

RAW_FILE = BASE_DIR / "walmart_results.json"
CLEAN_FILE = BASE_DIR / "walmart_clean.json"


# ==========================================
# 2. FORMAT WALMART PRODUCTS
# ==========================================

def format_walmart_products():

    # Load existing Walmart results
    with open(RAW_FILE, "r", encoding="utf-8") as file:
        raw_data = json.load(file)

    zipcode = raw_data.get("zipcode")
    formatted_results = {}

    # Process each grocery search
    for grocery_item, response in raw_data.get(
        "results", {}
    ).items():

        formatted_products = []

        # Handle API errors
        if not isinstance(response, dict):
            formatted_results[grocery_item] = []
            continue

        if "error" in response:
            print(
                f"Error for {grocery_item}: "
                f"{response['error']}"
            )
            formatted_results[grocery_item] = []
            continue

        # Nimble stores products inside data.parsing
        parsing_data = (
            (response.get("data") or {}).get("parsing") or []
        )

        for product in parsing_data:

            if not isinstance(product, dict):
                continue

            name = product.get("product_name")
            price = product.get("product_price")

            # Ignore records without a valid name or price
            if not name or not isinstance(price, (int, float)):
                continue

            if isinstance(price, bool) or price < 0:
                continue

            formatted_products.append({
                "product_name": name,
                "price": price,
                "availability": product.get(
                    "product_availability"
                ),
                "out_of_stock": product.get(
                    "product_out_of_stock"
                ),
                "seller": product.get("product_seller"),
                "store_location": product.get(
                    "store_location"
                ),
                "url": product.get("product_url"),
                "image": product.get("product_image"),
                "sponsored": product.get(
                    "sponsored", False
                ),
                "product_id": product.get("product_id")
            })

        formatted_results[grocery_item] = formatted_products

        print(
            f"{grocery_item}: "
            f"{len(formatted_products)} priced products"
        )

    # ==========================================
    # 3. SAVE CLEAN JSON
    # ==========================================

    output = {
        "store": "Walmart",
        "zipcode": zipcode,
        "results": formatted_results
    }

    with open(CLEAN_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=2)

    print(f"\nSaved formatted results to: {CLEAN_FILE}")

    return output


# ==========================================
# 4. RUN SCRIPT
# ==========================================

if __name__ == "__main__":
    format_walmart_products()
  