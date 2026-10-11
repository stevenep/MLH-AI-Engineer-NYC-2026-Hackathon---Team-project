import ssl
import certifi

from nimble_python import Nimble
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from geopy.distance import geodesic

def find_store_links(nimble, store_name, store_address):
    response = nimble.search(
        query=(
            f"{store_name} {store_address} official website groceries"
        ),
        search_depth="lite",
        max_results=3,
    )

    return [
        {
            "title": result.title,
            "url": result.url,
            "description": result.description,
        }
        for result in response.results
    ]


def find_grocery_stores(start_address, api_key, radius_miles=5):
    nimble = Nimble(api_key=api_key)

    # GeoPy is a separate library for coordinates and distance.
    geolocator = Nominatim(
        user_agent="grocery-finder/1.0",
        timeout=15,
        ssl_context=ssl.create_default_context(
            cafile=certifi.where()
        ),
    )

    geocode = RateLimiter(
        geolocator.geocode,
        min_delay_seconds=1.1,
        max_retries=1,
        swallow_exceptions=True,
    )

    # Ask for the starting address once.
    location = geocode(start_address)

    if location is None:
        raise ValueError("Could not locate the starting address.")

    origin = (location.latitude, location.longitude)
    print(f"\nSearching near: {location.address}")

    # Retrieve structured business records, including addresses.
    try:
        response = nimble.extract.templates.run(
            template="google_maps_search",
            params={
                "query": (
                    f"Grocery stores and supermarkets near "
                    f"{start_address}"
                )
            },
        )
    except Exception as error:
        raise RuntimeError("Nimble request failed.") from error

    parsed = response.data.parsing if response.data else None

    if not isinstance(parsed, dict):
        raise RuntimeError(
            "Nimble did not return the expected structured data."
        )

    entities = parsed.get("entities", {})
    stores = entities.get("SearchResult", [])

    if not stores:
        return []

    nearby_stores = []
    seen_addresses = set()
    skipped = 0

    print(f"Checking distances for {len(stores)} results...")

    for store in stores:
        if not isinstance(store, dict):
            skipped += 1
            continue

        print("RAW STORE:", store)
        # These values now come from Nimble, not manual input.
        store_name = store.get("title")
        store_address = store.get("address")

        if not isinstance(store_name, str) or not isinstance(
            store_address, str
        ):
            skipped += 1
            continue

        store_name = store_name.strip()
        store_address = store_address.strip()

        if not store_name or not store_address:
            skipped += 1
            continue

        store_location = geocode(store_address)

        if store_location is None:
            skipped += 1
            continue

        address_key = store_location.address.casefold()

        if address_key in seen_addresses:
            continue

        seen_addresses.add(address_key)

        destination = (
            store_location.latitude,
            store_location.longitude,
        )

        distance_miles = geodesic(origin, destination).miles

        if distance_miles <= radius_miles:

            nearby_stores.append({
                "name": store_name,
                "address": store_address,
                "distance": distance_miles,
            })

    # Sort the retrieved stores and return at most 15.
    nearby_stores.sort(key=lambda store: store["distance"])
    nearby_stores = nearby_stores[:15]

    for store in nearby_stores:
        try:
            response = nimble.search(
                query=(
                    f"{store['name']} {store['address']} official website"
                ),
                search_depth="lite",
                max_results=1,
            )

            store["website"] = (
                response.results[0].url
                if response.results
                else None
            )

        except Exception:
            store["website"] = None

    return nearby_stores