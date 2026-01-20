Конечно — вот обновлённый **DESCRIPTION.md**: без *Out of Scope* и полностью на английском.

---

# DESCRIPTION.md — Inventory Management System (MVP)

## 1. Vision

Build a simple and user-friendly web application for small businesses (store/warehouse) to manage products, track incoming and outgoing stock, automatically calculate current inventory levels, and quickly identify items with low stock. The system should be easy to use without training and remain fast and responsive.

---

## 2. Goals

1. Provide a single place to manage products and their inventory levels.
2. Automate stock tracking through incoming/outgoing transactions.
3. Reduce the risk of running out of items by highlighting low-stock products.
4. Deliver a convenient interface with search, filters, sorting, and clear low-stock indicators.
5. Support CSV export for reporting and working with spreadsheets (Excel/Google Sheets).

---

## 3. Scope (MVP Features)

### 3.1. Authentication (Login)

* The system includes a login feature.
* The application assumes a single user tyowner/adminin** (no regular users).
* All features are available only after login.

---

### 3.2. Product Management

Users can:

* Create products
* Edit products
* Delete products (or deactivate them)

Each product includes:

* name
* unit (e.g., pcs)
* per-product low-stock threshold min_stock

---

### 3.3. Stock Movements (Incoming / Outgoing)

Users can create stock transactions:

* IN (incoming stock / restock)
* OUT (outgoing stock / issue)

Rules:

* quantity must be greater than 0
* stock balance is updated automatically based on movements

---

### 3.4. Stock Level Calculation

* Stock balance is calculated astotal(IN) − total(OUT)T)**
* The current balance is displayed in the inventory list.

---

### 3.5. Low Stock Alerts

Low-stock detection rule:

* A product is considered low-stock ifbalance <= min_stockck**

Alert behavior:

* The system sha single popup notificationon** if at least one low-stock product exists.
* The popup must not spam the user:

  * it should respect a cooldown period (e.g., not more than once per N hours)
* For easier viewing:

  * low-stock products can be automatically moved to the top of the inventory list (low-first sorting)
* Both features can be disabled via settings:

  * popup notification on/off
  * low-first sorting on/off

---

### 3.6. Search, Filters, Sorting

The inventory list supports:

* Search productsnameme**
* Filters:

  * show only low-stock products
  * show only active products (if soft delete is used)
* Sorting:

  * by name
  * by balance
  * low-stock first (if enabled)

---

### 3.7. CSV Export

The system supports exporting data to CSV:

* Products + balances export
* Stock movements export (optionally with date filtering)

---

## 4. Success Criteria

The MVP is considered successful if:

1. A user can log in and access features only after authentication.
2. A user can create a product and set its min_stock threshold.
3. A user can create incoming/outgoing movements and stock balances update correctly.
4. The inventory page always shows up-to-date balances.
5. Low-stock products are easy to identify and manage:

   * a single popup appears when low-stock products exist
   * low-stock products are pinned to the top if enabled
6. Search, filters, and sorting make it easy to find products.
7. CSV export files open correctly in Excel/Google Sheets.

---

## 5. Constraints

* The project is a web application:

  * Backend: Python + FastAPI
  * Frontend: React or Vue
* The database can start with SQLite.
* The system is designed for simplicity and quick setup.
* Only one user type exists (owner/admin); no multi-user roles are required.

---

## 6. GlossaryProductct** — an inventory item (e.g., “Sugar 1kg”)Stock movementnt** — a transaction that changes stock:

ININ** — incoming stock (restock)
OUTUT** — outgoing stock (issue/saleBalance / Stock levelel** — current stock amount:
  total(IN) − total(OUTLow-stockck** — a state where the balance is less than or equal to the thresholdmin_stockck** — per-product threshold that triggers low-stock statusLow-first sortingng** — ordering where low-stock products appear at the topCooldownwn** — minimum time between popup notifications.

---