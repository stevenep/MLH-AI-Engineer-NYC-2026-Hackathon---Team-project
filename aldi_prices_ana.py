from urllib.parse import urlparse
from test_aldi import get_aldi_price


def find_aldi_prices(nimble, items):
    results = []

    for item in items:
        # Include the retailer name explicitly.
        search = nimble.search(
            query=f"ALDI {item} grocery product",
            search_depth="standard",
            max_results=10,
        )

        products = []
        seen_urls = set()

        for page in search.results:
            url = page.url
            parsed = urlparse(url)
            hostname = (parsed.hostname or "").lower()

            # Accept ALDI shopping product pages only.
            is_aldi = (
                hostname == "aldi.us"
                or hostname.endswith(".aldi.us")
            )

            if (
                not is_aldi
                or "/store/aldi/products/" not in parsed.path
                or url in seen_urls
            ):
                continue

            seen_urls.add(url)

            try:
                product = get_aldi_price(nimble, url)
                products.append(product)

            except Exception as error:
                print(
                    f"Could not extract {url}: "
                    f"{type(error).__name__}: {error}"
                )

            # Return up to 3 extracted candidates per item.
            if len(products) >= 3:
                break

        results.append({
            "requested_item": item,
            "products": products,
        })

    return results