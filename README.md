# StockCheck Web App (MVP)

Inventory Management for Small Retail & Warehouses
Helps small business owners track stock levels, view incoming/outgoing transactions, and receive alerts before running out of stock — deployed and ready to use.

## Demo

- Live demo: https://inventory-app-v1.onrender.com/
- Docker image: https://docker.io/plzgivemepizza/inventory-app

Default credentials:

- Username: `admin`
- Password: `simplepass`

<img width="531" height="648" alt="image" src="https://github.com/user-attachments/assets/bfc8631f-c119-4fef-aa49-db412905114e" />


## Features (MVP)

- Login for a single owner/admin user
- Product management: create, edit, deactivate/delete
<img width="1850" height="636" alt="image" src="https://github.com/user-attachments/assets/4ef332ca-399b-4890-9c84-f752504c4aeb" />

- Per-product low-stock threshold (`min_stock`)
- Stock movements: IN (restock) and OUT (issue/sale)
<img width="605" height="647" alt="image" src="https://github.com/user-attachments/assets/1081aaea-5ed4-4677-b204-27378d2f0615" />
- Automatic balance calculation: total(IN) − total(OUT)
- Low-stock alerts with optional popup + cooldown
<img width="1864" height="665" alt="image" src="https://github.com/user-attachments/assets/3b430f63-1e78-4617-b7b1-19fceed3795b" />
<img width="1860" height="440" alt="image" src="https://github.com/user-attachments/assets/70202efd-6091-405e-a646-728012ba29de" />
- Optional low-stock pin-to-top sorting
- Search, filters, and sorting for the inventory list
<img width="1847" height="479" alt="image" src="https://github.com/user-attachments/assets/9ee1964f-a8e4-41a2-a36c-65a378ff681e" />
- CSV export for products/balances and movements
<img width="1918" height="781" alt="image" src="https://github.com/user-attachments/assets/201cccc2-21ed-4fd7-a0cf-9eb9cacfbaad" />


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
