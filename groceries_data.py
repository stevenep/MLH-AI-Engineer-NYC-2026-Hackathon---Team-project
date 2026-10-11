from getpass import getpass
import ssl
import certifi

from nimble_python import Nimble
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from geopy.distance import geodesic
from urllib.parse import urlencode


def main():
    api_key = getpass("Enter your Nimble API key: ").strip()

    if not api_key:
        print("Please provide an API key.")
        return

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
    start_address = input(
        "Enter your address, including city and state: "
    ).strip()

    if not start_address:
        print("Please enter an address.")
        return

    location = geocode(start_address)

    if location is None:
        print("Address lookup failed. Try a complete street address.")
        return

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
        print(f"Nimble request failed: {type(error).__name__}")
        print("Check your API key, account access, and connection.")
        return

    parsed = response.data.parsing if response.data else None

    if not isinstance(parsed, dict):
        print("Nimble did not return the expected structured data.")
        return

    entities = parsed.get("entities", {})
    stores = entities.get("SearchResult", [])

    if not stores:
        print("No store records returned.")
        return

    maps_url = "https://www.google.com/maps/search/?" + urlencode({
    "api": 1,
    "query": f"{store_name}, {store_address}",
})

    nearby_stores = []
    seen_addresses = set()
    skipped = 0

    print(f"Checking distances for {len(stores)} results...")

    for store in stores:
        if not isinstance(store, dict):
            skipped += 1
            continue

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

        # Keep the strict 5-mile filter.
        if distance_miles <= 5:
            nearby_stores.append({
                "name": store_name,
                "address": store_address,
                "distance": distance_miles,
                "source": maps_url,
            })

    # Sort the retrieved stores and return at most 15.
    nearby_stores.sort(key=lambda store: store["distance"])
    nearby_stores = nearby_stores[:15]

    print(
        f"\n=== Found {len(nearby_stores)} stores "
        f"within 5 miles ==="
    )

    for number, store in enumerate(nearby_stores, start=1):
        print(f"\n{number}. {store['name']}")
        print(f"Address: {store['address']}")
        print(f"Distance: {store['distance']:.2f} miles")
        print(f"Source: {store['source']}")

    if not nearby_stores:
        print("No retrieved stores passed the distance check.")

    if skipped:
        print(
            f"\nSkipped {skipped} results with missing details "
            "or unsuccessful address lookups."
        )


if __name__ == "__main__":
    main()