import os
import json

from nimble_python import Nimble
from aldi_prices_ana import find_aldi_prices

api_key = os.environ.get("NIMBLE_API_KEY", "").strip()

if not api_key:
    raise RuntimeError("NIMBLE_API_KEY is not set.")

nimble = Nimble(api_key=api_key)

user_input = input(
    "Enter grocery items separated by commas: "
)

items = [
    item.strip()
    for item in user_input.split(",")
    if item.strip()
]

if not items:
    raise ValueError("Enter at least one grocery item.")

results = find_aldi_prices(nimble, items)

print(json.dumps(results, indent=2))