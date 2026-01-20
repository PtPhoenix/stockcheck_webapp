# ROADMAP.md — Project Map (Inventory Management System MVP)

## CHAPTER 1 — Project Foundation

### STAGE 1.1 — Repository & Workspace Setup

* Create a monorepo structure: backend/ + frontend/
* Initialize Git repository
* Add .gitignore, basic README
* Define environment variables structure (.env.example)

### STAGE 1.2 — Backend Skeleton (FastAPI)

* Create FastAPI app entry point
* Add health check endpoint (GET /ping)
* Configure settings module (app name, secret key, DB URL)
* Enable CORS for frontend origin

### STAGE 1.3 — Database Setup

* Configure SQLAlchemy engine + session
* Initialize Alembic migrations
* Create base database structure

---

## CHAPTER 2 — Authentication (Owner/Admin Login)

### STAGE 2.1 — User Model

* Implement User database model
* Add password hashing utilities
* Create admin/owner seed user logic

### STAGE 2.2 — Login API

* Implement POST /auth/login
* Issue authentication token (JWT) and store in cookie (HttpOnly)
* Implement GET /auth/me for session validation
* Implement POST /auth/logout to clear authentication cookie

### STAGE 2.3 — Protected API Access

* Create backend dependency for authenticated requests
* Protect all business endpoints behind login

---

## CHAPTER 3 — Product Management

### STAGE 3.1 — Product Model

* Implement Product model
* Include per-product low-stock threshold (min_stock)
* Include product-level low-stock enable flag (low_stock_enabled)
* Add soft-delete support (active/inactive)

### STAGE 3.2 — Product CRUD API

* Implement product create endpoint
* Implement product update endpoint
* Implement product delete/deactivate endpoint
* Implement product list endpoint with pagination

### STAGE 3.3 — Search Support

* Add product search by name to list endpoint
* Validate search behavior (case-insensitive, partial match)

---

## CHAPTER 4 — Stock Movements & Inventory Balances

### STAGE 4.1 — Movement Model

* Implement StockMovement model
* Support movement types: IN and OUT
* Store quantity, timestamp, optional note, created_by

### STAGE 4.2 — Movement API

* Implement POST /movements to create incoming/outgoing movements
* Implement GET /movements list endpoint with basic filters

### STAGE 4.3 — Balance Calculation Service

* Implement balance calculation logic: total(IN) − total(OUT)
* Provide a backend function to compute balance per product
* Ensure products with no movements return balance = 0

---

## CHAPTER 5 — Inventory UI (Warehouse Tab)

### STAGE 5.1 — Stock Overview API

* Implement GET /stock/overview endpoint returning:

  * product fields + computed balance + low-stock flag
* Support query parameters:

  * search by name
  * filter low-stock only
  * filter active only
  * sorting by name/balance
  * optional “low-stock first” ordering

### STAGE 5.2 — Low Stock Count API

* Implement GET /stock/low/count endpoint
* Return total number of low-stock products

---

## CHAPTER 6 — Low Stock Alert Experience (No Spam)

### STAGE 6.1 — Settings Model & API

* Create settings storage (single owner scope)
* Implement GET /settings
* Implement PUT /settings to update:

  * low-stock popup enabled/disabled
  * low-stock pin-to-top enabled/disabled
  * popup cooldown hours

### STAGE 6.2 — Frontend Popup Logic

* Show a single popup if low-stock count > 0
* Respect cooldown to avoid repeated notifications
* Provide actions:

  * “Show low-stock” (enable low-only filter)
  * “Close”

### STAGE 6.3 — Low-Stock Pin-to-Top Behavior

* If enabled, apply low-first sorting on the inventory page
* If disabled, use normal sorting only

---

## CHAPTER 7 — Frontend Application (React/Vue)

### STAGE 7.1 — Frontend Skeleton

* Initialize frontend project (React or Vue)
* Configure API client with credentials support
* Setup routing and protected routes

### STAGE 7.2 — Login Page

* Build login form UI
* Connect to backend login endpoint
* Handle login errors and success redirect

### STAGE 7.3 — Inventory Page (Main Screen)

* Build inventory table UI
* Add search input
* Add low-stock filter toggle
* Add sorting controls
* Highlight low-stock rows
* Add “IN / OUT” actions per product

### STAGE 7.4 — Product Management UI

* Add product create/edit modal or page
* Validate product fields (name, min_stock)
* Add delete/deactivate action

### STAGE 7.5 — Movement UI

* Add movement create modal (IN/OUT)
* Add movements history page/table
* Add movement filters (optional)

### STAGE 7.6 — Settings UI

* Add settings panel/page for low-stock behavior toggles
* Save settings to backend

---

## CHAPTER 8 — CSV Export

### STAGE 8.1 — Export API

* Implement GET /export/products.csv
* Implement GET /export/movements.csv (optional date filtering)
* Ensure UTF-8 encoding and spreadsheet compatibility

### STAGE 8.2 — Export UI

* Add export buttons to the inventory page
* Trigger CSV download from frontend

---

## CHAPTER 9 — Validation, Testing, Quality

### STAGE 9.1 — Backend Validation Rules

* Enforce quantity > 0 for movements
* Enforce min_stock >= 0 for products
* Prevent invalid movement types

### STAGE 9.2 — Core Automated Tests

* Test authentication flow (login + protected endpoints)
* Test balance calculation correctness
* Test low-stock detection logic
* Test stock overview search/filter behavior

### STAGE 9.3 — UX Polishing

* Add loading states and error messages
* Confirm inventory updates after movements
* Ensure low-stock popup behavior is correct and non-spammy

---

## CHAPTER 10 — Packaging & Run Instructions

### STAGE 10.1 — Local Development Workflow

* Document backend run commands
* Document frontend run commands
* Add environment setup steps

### STAGE 10.2 — Production Build Notes

* Document frontend build output usage
* Confirm CORS/cookie settings for deployment