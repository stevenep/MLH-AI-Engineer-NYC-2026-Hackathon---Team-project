import os
from getpass import getpass
import json

from nimble_python import Nimble
from groceries_prices import find_price_candidates

api_key = os.environ.get("NIMBLE_API_KEY", "").strip()

if not api_key:
    raise RuntimeError("NIMBLE_API_KEY is not set in this terminal.")

nimble = Nimble(api_key=api_key)

# Enter the actual product-shopping domain, not a Maps or directory URL.
domain = input(
    "Shopping domain, without https:// or a path: "
).strip().lower()

candidates = find_price_candidates(
    nimble,
    shopping_domain=domain,
    item_query="whole milk 1 gallon",
)

print(json.dumps(candidates, indent=2))