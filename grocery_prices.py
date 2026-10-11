
import os
import json
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

from pathlib import Path

env_path = Path(__file__).resolve().parent / "AI-Agent" / ".env"
load_dotenv(dotenv_path=env_path)

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])


def find_prices(stores, grocery_list, zipcode):
    results = []

    for store in stores:
        # Skip directory listings rather than actual shops
        website = store.get("website", "")
        if not website or "chamberofcommerce.com" in website:
            continue

        for product in grocery_list:
            prompt = f"""
Find the CURRENT online grocery price for:

Product: {product}
Store: {store['name']}
Store address: {store['address']}
ZIP code: {zipcode}
Website: {website}

Use Google Search to locate a matching product listing.

Requirements:
- Match the exact retailer and shopping location.
- Never use a price from a different location.
- Never invent or estimate a price.
- Include the price unit (each, pound, etc.).
- Include the direct product URL when available.
- If the price cannot be confirmed for this
  location, return null for price.

Return ONLY a JSON object with:
product, price, unit, source_url
"""

            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        tools=[types.Tool(
                            google_search=types.GoogleSearch()
                        )]
                    ),
                )

                raw = (response.text or "").strip()
                raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw)

                data = json.loads(raw)

                # Store claims, not independently verified prices
                results.append({
                    "store": store["name"],
                    "address": store["address"],
                    "product": product,
                    "price": data.get("price"),
                    "unit": data.get("unit"),
                    "source_url": data.get("source_url"),
                    "status": "needs_verification"
                })

            except Exception as error:
                results.append({
                    "store": store["name"],
                    "product": product,
                    "price": None,
                    "status": "error",
                    "error": str(error)
                })

    return results


if __name__ == "__main__":
    # Initial inexpensive test: one store, one product
    test_stores = [{
        "name": "Target Grocery",
        "address": "112 W 34th St, New York, NY 10120",
        "website": "https://www.target.com/sl/manhattan-herald-square/3277"
    }]

    prices = find_prices(test_stores, ["banana"], "10001")
    print(json.dumps(prices, indent=2))
  