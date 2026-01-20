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
- Frontend: React or Vue (TBD)
- Auth: JWT in HttpOnly cookie

## Repository Structure

- `backend/` FastAPI service (to be implemented)
- `frontend/` React/Vue client (to be implemented)
- `docs/` project documentation

## Environment

1. Copy `.env.example` to `.env`.
2. Adjust values as needed.
