
import json
import re
from pathlib import Path

# ==========================================
# 1. FILE PATHS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

CLEAN_FILE = BASE_DIR / "walmart_clean.json"
MATCHED_FILE = BASE_DIR / "walmart_matched.json"


# ==========================================
# 2. PRODUCT MATCHING RULES
# ==========================================

# Words that identify products we don't want
# when searching for a basic fresh grocery item.
PROCESSED_WORDS = {
    "dried", "freeze-dried", "chips", "crisps",
    "powder", "candy", "flavored", "flavoured",
    "snack", "frozen", "sliced", "bread",
    "cookies", "cake", "mix", "dehydrated"
}

# Item-specific rules for common groceries.
# We can expand these as needed.
GROCERY_RULES = {
    "banana": {
        "keywords": ["banana", "bananas"],
        "preferred": ["fresh", "each"],
        "excluded": list(PROCESSED_WORDS) + ["plantain"]
    },
    "milk": {
        "keywords": ["milk"],
        "preferred": ["whole milk", "gallon"],
        "excluded": [
            "almond", "oat", "soy", "powder",
            "chocolate", "condensed", "evaporated"
        ]
    },
    "eggs": {
        "keywords": ["egg", "eggs"],
        "preferred": ["large", "dozen", "12 count"],
        "excluded": [
            "chocolate", "easter", "powder",
            "liquid", "substitute"
        ]
    },
    "bread": {
        "keywords": ["bread"],
        "preferred": ["white", "wheat", "loaf"],
        "excluded": [
            "crumbs", "mix", "pudding"
        ]
    }
}


# ==========================================
# 3. HELPER FUNCTIONS
# ==========================================

def normalize(text):
    """Convert text to lowercase normalized words."""
    return re.sub(
        r"\s+", " ", str(text or "").lower()
    ).strip()


def contains_term(text, term):
    """Match complete words or phrases."""
    pattern = r"(?<!\w)" + re.escape(term) + r"(?!\w)"
    return re.search(pattern, text) is not None


def get_rules(search_term):
    """Find matching rules or create generic ones."""
    normalized = normalize(search_term)

    if normalized in GROCERY_RULES:
        return GROCERY_RULES[normalized]

    return {
        "keywords": [normalized],
        "preferred": [],
        "excluded": []
    }


# ==========================================
# 4. SCORE AND FILTER PRODUCTS
# ==========================================

def score_product(product, search_term):
    """
    Rank products by relevance to the grocery item.
    Returns None when a product is not a good match.
    """

    name = normalize(product.get("product_name"))
    seller = normalize(product.get("seller"))
    rules = get_rules(search_term)

    if not name:
        return None

    # Product must match at least one search keyword
    if not any(
        contains_term(name, word)
        for word in rules["keywords"]
    ):
        return None

    # Reject unwanted or processed products
    if any(
        contains_term(name, word)
        for word in rules["excluded"]
    ):
        return None

    # Require a valid price
    price = product.get("price")

    if (
        isinstance(price, bool)
        or not isinstance(price, (int, float))
        or price < 0
    ):
        return None

    # Exclude explicitly out-of-stock products
    if product.get("out_of_stock") is True:
        return None

    score = 0

    # Exact name match
    if name == normalize(search_term):
        score += 100

    # Prefer familiar product descriptions
    for word in rules["preferred"]:
        if contains_term(name, word):
            score += 20

    # Prefer products sold by Walmart
    if "walmart" in seller:
        score += 30

    # Prefer non-sponsored listings
    if not product.get("sponsored", False):
        score += 5

    # Prefer search results closer to the requested name
    if name.startswith(normalize(search_term)):
        score += 15

    return score


# ==========================================
# 5. FIND BEST PRODUCT MATCHES
# ==========================================

def match_grocery_products(clean_data, top_n=5):
    """
    Find the best matching Walmart products
    for every item in the grocery list.
    """

    results = {}

    for search_term, products in clean_data.get(
        "results", {}
    ).items():

        matches = []

        for product in products:
            score = score_product(product, search_term)

            if score is None:
                continue

            matches.append({
                **product,
                "match_score": score
            })

        matches.sort(
            key=lambda item: (
                -item["match_score"],
                item["price"]
            )
        )

        results[search_term] = {
            "best_match": matches[0] if matches else None,
            "alternatives": matches[1:top_n],
            "matches_found": len(matches),
            "status": (
                "candidate_found" if matches
                else "no_match"
            )
        }

    return {
        "store": clean_data.get("store", "Walmart"),
        "zipcode": clean_data.get("zipcode"),
        "results": results
    }


# ==========================================
# 6. SAVE MATCHED RESULTS
# ==========================================

def save_matches(data):
    """Save matching results to a JSON file."""

    with open(MATCHED_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)

    print(f"\nSaved matched results to: {MATCHED_FILE}")


# ==========================================
# 7. RUN PROGRAM
# ==========================================

if __name__ == "__main__":

    # Read the cleaned Walmart product data
    with open(CLEAN_FILE, "r", encoding="utf-8") as file:
        clean_data = json.load(file)

    # Find matching products
    output = match_grocery_products(clean_data)

    print("\n========== WALMART BEST MATCHES ==========")

    for item, result in output["results"].items():

        print(f"\nGrocery item: {item}")
        print(f"Status: {result['status']}")
        print(f"Matches found: {result['matches_found']}")

        best = result["best_match"]

        if best:
            print(f"Best product: {best['product_name']}")
            print(f"Price: ${best['price']:.2f}")
            print(f"Seller: {best['seller']}")
            print(f"Match score: {best['match_score']}")
            print(f"URL: {best['url']}")
        else:
            print("No suitable product match found.")

    save_matches(output)
  