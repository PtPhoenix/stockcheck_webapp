# StockCheck Web App (MVP)

Inventory management web app for small stores and warehouses. It tracks products, incoming/outgoing stock, and highlights low inventory so you can restock in time.

## Demo

- Live demo: https://inventory-app-v1.onrender.com/
- Docker image: https://docker.io/plzgivemepizza/inventory-app

Default credentials:

- Username: `admin`
- Password: `simplepass`

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

- Backend: Python, FastAPI, SQLAlchemy, Alembic (SQLite for dev, Postgres for production)
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

## Deploy Using Docker Image

1. Pull the image:

```bash
docker pull plzgivemepizza/inventory-app:latest
```

2. Run the container (replace values as needed):

```bash
docker run --name inventory-app \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e SECRET_KEY="change-me" \
  -e ADMIN_EMAIL="admin" \
  -e ADMIN_PASSWORD="simplepass" \
  -e FRONTEND_ORIGIN="http://your-domain.com" \
  plzgivemepizza/inventory-app:latest
```

The app will be available at `http://your-domain.com` with the API under `/api`.

## Deploy By Building The Image Yourself

1. Build:

```bash
docker build -t inventory-app:latest .
```

2. Run:

```bash
docker run --name inventory-app \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dbname" \
  -e SECRET_KEY="change-me" \
  -e ADMIN_EMAIL="admin" \
  -e ADMIN_PASSWORD="simplepass" \
  -e FRONTEND_ORIGIN="http://your-domain.com" \
  inventory-app:latest
```
