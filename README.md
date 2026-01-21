# StockCheck Web App (MVP)

Inventory management web app for small stores and warehouses. It tracks products, incoming/outgoing stock, and highlights low inventory so you can restock in time.

## Features (MVP)

- Login for a single owner/admin user
- Product management: create, edit, deactivate/delete
- Per-product low-stock threshold (`min_stock`)
- Stock movements: IN (restock) and OUT (issue/sale)
- Automatic balance calculation: total(IN) − total(OUT)
- Low-stock alerts with optional popup + cooldown
- Optional low-stock pin-to-top sorting
- Search, filters, and sorting for the inventory list
- CSV export for products/balances and movements

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, Alembic, SQLite
- Frontend: React (Vite)
- Auth: JWT in HttpOnly cookie

## Repository Structure

- `backend/` FastAPI service
- `frontend/` React client
- `docs/` project documentation

## Local Development Workflow

### 1) Backend

1. Create a virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

2. Create a backend `.env` file:

```bash
cp ../.env.example .env
```

3. Run the API server:

```bash
uvicorn app.main:app --reload
```

### 2) Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create a frontend `.env` file:

```bash
cp .env.example .env
```

3. Start the dev server:

```bash
npm run dev
```

The frontend expects the API at `http://localhost:8000` by default.

## Production Build Notes

### Frontend build

```bash
cd frontend
npm run build
```

The production build is written to `frontend/dist/`. Host the contents on a static server
and point `VITE_API_BASE_URL` to your deployed backend URL.

### Deployment considerations

- Ensure `FRONTEND_ORIGIN` in `.env` matches the deployed frontend URL.
- Configure HTTPS and cookie security for the `access_token` cookie in production.
