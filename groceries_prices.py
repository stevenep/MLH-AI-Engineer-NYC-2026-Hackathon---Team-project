import json
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse

from bs4 import BeautifulSoup


def walk_json(value):
    """Visit objects inside nested JSON."""
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_json(child)

    elif isinstance(value, list):
        for child in value:
            yield from walk_json(child)


def extract_product_prices(nimble, url):
    """Read Product/Offer records published inside a webpage."""
    response = nimble.extract.run(
        url=url,
        render=True,
        formats=["html"],
    )

    html = response.data.html if response.data else None
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    products = []
    seen = set()

    for script in soup.select('script[type="application/ld+json"]'):
        try:
            document = json.loads(script.get_text())
        except (json.JSONDecodeError, TypeError):
            continue

        for record in walk_json(document):
            record_types = record.get("@type", [])
            if isinstance(record_types, str):
                record_types = [record_types]

            if "Product" not in record_types:
                continue

            name = record.get("name")
            if not isinstance(name, str) or not name.strip():
                continue

            offers = record.get("offers", [])
            if isinstance(offers, dict):
                offers = [offers]

            if not isinstance(offers, list):
                continue

            for offer in offers:
                if not isinstance(offer, dict):
                    continue

                # Require an explicit USD price.
                if offer.get("priceCurrency") != "USD":
                    continue

                try:
                    price = Decimal(str(offer["price"]))
                except (KeyError, InvalidOperation, ValueError):
                    continue

                if not price.is_finite() or price <= 0:
                    continue

                identity = (name, str(price))
                if identity in seen:
                    continue
                seen.add(identity)

                products.append({
                    "product_name": name,
                    "price": str(price),
                    "currency": "USD",
                    "availability": offer.get("availability"),
                    "product_url": url,
                    "checked_at": datetime.now(
                        timezone.utc
                    ).isoformat(),
                    "verified": False,
                })

    return products


def find_price_candidates(nimble, shopping_domain, item_query):
    """Search a known shopping domain, then extract candidate prices."""
    search = nimble.search(
        query=f"site:{shopping_domain} {item_query}",
        include_domains=[shopping_domain],
        search_depth="lite",
        max_results=3,
    )

    candidates = []

    for result in search.results:
        hostname = (urlparse(result.url).hostname or "").lower()

        # Reject links outside the configured retailer domain.
        if not (
            hostname == shopping_domain
            or hostname.endswith("." + shopping_domain)
        ):
            continue

        try:
            candidates.extend(
                extract_product_prices(nimble, result.url)
            )
        except Exception as error:
            print(
                f"Extraction failed for {result.url}: "
                f"{type(error).__name__}"
            )

    return candidates


def compare_baskets(store_baskets, required_items):
    """
    Each store basket has a 'prices' dictionary containing
    verified product selections, keyed by requested item.
    """
    results = []

    for store in store_baskets:
        prices = store.get("prices", {})
        missing = []
        total = Decimal("0")

        for item in required_items:
            product = prices.get(item)

            if not product or product.get("verified") is not True:
                missing.append(item)
                continue

            # Price must be the cost of the requested quantity.
            total += Decimal(str(product["price"]))

        results.append({
            "name": store["name"],
            "address": store["address"],
            "prices": prices,
            "missing_items": missing,
            "complete": not missing,
            "total": str(total) if not missing else None,
        })

    complete = sorted(
        [store for store in results if store["complete"]],
        key=lambda store: Decimal(store["total"]),
    )

    return {
        "best_store": complete[0] if complete else None,
        "ranked_complete_baskets": complete,
        "incomplete_baskets": [
            store for store in results if not store["complete"]
        ],
    }