import os
import re
import json
from datetime import datetime, timezone

from bs4 import BeautifulSoup
from nimble_python import Nimble


def get_aldi_price(nimble, product_url):
    response = nimble.extract.run(
        url=product_url,
        render=True,
        formats=["html"],
    )

    html = response.data.html if response.data else None

    if not html:
        raise RuntimeError("Nimble returned no HTML.")

    soup = BeautifulSoup(html, "html.parser")

    # Remove scripts/styles before reading page text.
    for element in soup(["script", "style"]):
        element.decompose()

    heading = soup.find("h1")
    product_name = (
        heading.get_text(" ", strip=True)
        if heading
        else None
    )

    text = soup.get_text(" ", strip=True)

    # Try the labeled price first.
    matches = re.findall(
        r"Current\s+price\s*:\s*\$\s*(\d+(?:,\d{3})*\.\d{2})",
        text,
        flags=re.IGNORECASE,
    )

    # Fallback: look for the exact product name followed by its price.
    if not matches and product_name:
        matches = re.findall(
            re.escape(product_name)
            + r"\s+\$\s*(\d+(?:,\d{3})*\.\d{2})",
            text,
            flags=re.IGNORECASE,
        )

    unique_prices = set(matches)

    if not product_name or len(unique_prices) != 1:
        print("PAGE TEXT PREVIEW:", text[:2500])
        raise RuntimeError(
            "Could not identify one unambiguous product price."
        )

    price = unique_prices.pop().replace(",", "")

    out_of_stock = bool(
        re.search(r"\bout of stock\b", text, re.IGNORECASE)
    )

    return {
        "store": "ALDI",
        "product_name": product_name,
        "price": price,
        "currency": "USD",
        "availability": (
            "out_of_stock" if out_of_stock else "unknown"
        ),
        "product_url": product_url,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "price_scope": "Online page; local branch not verified",
    }


if __name__ == "__main__":
    api_key = os.environ.get("NIMBLE_API_KEY", "").strip()

    if not api_key:
        raise RuntimeError(
            "Set NIMBLE_API_KEY in this terminal first."
        )

    nimble = Nimble(api_key=api_key)

    # Real ALDI product page: half-gallon 1% milk.
    url = (
        "https://www.aldi.us/store/aldi/products/"
        "20989941-friendly-farms-1-milk-0-5-gal"
    )

    result = get_aldi_price(nimble, url)
    print(json.dumps(result, indent=2))