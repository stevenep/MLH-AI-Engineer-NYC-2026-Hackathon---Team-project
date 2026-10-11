# MLH-AI-Engineer-NYC-2026-Hackathon---Team-project

## Frontend

The React + JavaScript app lives in [`frontend/`](./frontend). It uses Vite and
Material UI to provide a green-themed Home dashboard and an interactive AI
grocery comparison demo. Comparison results are generated from local mock data;
the frontend does not call a backend API or save shopping history.

```bash
cd frontend
npm install
npm run dev
```

Run `npm run build` to create a production build in `frontend/dist/`. Demo store
and product prices are defined in `frontend/src/mockData.js` for easy
replacement during backend integration.