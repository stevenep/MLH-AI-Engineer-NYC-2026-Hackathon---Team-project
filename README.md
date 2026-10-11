# BROCERY BASKET 🛒🥬🥒🍅

### Your neighborhood. Your grocery list. Fewer tabs.

**A hackathon project that helps shoppers discover nearby grocery stores and explore product prices from multiple stores.**

Built for students and anyone shopping on a budget, BroceryBasket connects location discovery with live web extraction. Enter an address and a grocery list, then explore nearby stores and product candidates with prices and source links.

> **Current demo:** nearby-store discovery + ALDI & Walmart online price extraction. Comparing verified local baskets across multiple retailers is our next milestone.

## 💡 The problem

Planning an affordable grocery trip often means opening maps, searching store websites, checking individual products, and comparing package sizes. A nearby store is easy to find; understanding what your groceries might cost requires more work.

We bring those steps together so shoppers can spend less time searching and make more informed decisions.

## ✨ What works today

| Feature | What it does |
| --- | --- |
| 📍 Nearby grocery discovery | Finds store candidates, geocodes their addresses, and returns up to 15 within a 5-mile straight-line radius. |
| 🧭 Distance sorting | Orders retrieved stores from nearest to farthest. |
| 🔗 Store link discovery | Searches for a website link for each store. Links are search results and may include directories. |
| 🥛 Grocery-list input | Accepts multiple items such as milk, eggs, and bread. |
| 💵 Price extraction | Discovers product pages and extracts published prices from rendered page content. |
| 📦 Product context | Returns product names, availability indicators, page links, and retrieval timestamps. |
| 🔌 Frontend-ready API | Serves JSON through Flask for store cards and product results. |

## 🧠 How Nimble powers the project

Nimble supplies the live web data behind three parts of the prototype:

1. **Business discovery:** the Google Maps extraction template returns store names and addresses.
2. **Web search:** finds store links and candidate ALDI and Walmart product pages for user-entered groceries.
3. **Rendered extraction:** retrieves ALDI page HTML so our parser can identify a product name and its displayed price.

GeoPy is a separate library: it turns addresses into coordinates and calculates the distance filter. Beautiful Soup and regular expressions parse the retrieved product pages.

## ⚙️ Architecture

| Layer | Responsibility |
| --- | --- |
| Frontend | Collect address and grocery items; display store and product results. |
| Flask backend | Validate requests and coordinate store discovery and price lookup. |
| Nimble | Search the web, retrieve business records, and render product pages. |
| GeoPy / Nominatim | Geocode addresses and calculate geodesic distances. |
| Beautiful Soup / regex | Read product names, price text, and stock indicators. |

The nearby-store list and ALDI and Walmart product prices are separate outputs. An ALDI price is not assigned to another retailer or assumed to belong to a nearby branch.

## 🚀 Run locally

### Requirements

- Python 3.10 or newer; development used Python 3.13.
- A Nimble account with an active API key.
- Internet access for web retrieval and geocoding.

From the cloned repository:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install flask nimble_python geopy certifi beautifulsoup4
```

Set the key in the same terminal that runs Flask. For Bash:

```bash
read -r -s -p "Nimble API key: " NIMBLE_API_KEY
export NIMBLE_API_KEY
```

For macOS zsh:

```zsh
read -s "NIMBLE_API_KEY?Nimble API key: "
export NIMBLE_API_KEY
```

Start the server:

```bash
python app.py
```

The default development address is `http://127.0.0.1:5000`. Keep API keys in the backend environment and out of frontend code and Git commits.

Frontend startup depends on the team's frontend implementation. When using a separate development server, proxy `/api` requests to Flask. `localhost` refers to the machine making the request.

### Test without a frontend

Keep Flask running and execute this in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

In a separate terminal from the repository root, start the Flask backend on
port 5001. Activate your Python environment and load the Nimble API key before
starting Flask:

```bash
source .venv/bin/activate
set -a
source AI-Agent/.env
set +a
flask --app app run --host 127.0.0.1 --port 5001
```

Vite proxies frontend `/api` requests to `http://127.0.0.1:5001` during
development. The AI page sends the address and selected radius (1, 3, 5, or 10
miles) to Flask and shows each returned store's distance, address, and available
website. Restart Flask after changing the backend. Run `npm run build` in
`frontend/` to create production assets in `frontend/dist/`.