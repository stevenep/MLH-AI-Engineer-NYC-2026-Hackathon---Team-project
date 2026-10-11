# MLH-AI-Engineer-NYC-2026-Hackathon---Team-project

## Frontend

The React + JavaScript app lives in [`frontend/`](./frontend). It uses Vite and
Material UI to provide a green-themed Home dashboard and an AI grocery store
finder. The AI page sends the entered address to the Flask backend and displays
nearby stores, distances, addresses, and available website links.

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