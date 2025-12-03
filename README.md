# Ecommerce Cart + Discount Prototype

TypeScript + Express backend with an in-memory store and a Vite + React UI to demo cart, checkout, and admin discount flows. Every _nth_ order can redeem a 10% code generated through the admin API.

## Getting started

```bash
npm install
npm run dev           # start API on :3000

# frontend (runs on :5173 with proxy to :3000)
npm run client:dev
```

Builds:

```bash
npm run build         # compile backend
npm run client:build  # build frontend
```

Postman: import `postman_collection.json` (baseUrl defaults to `http://localhost:3000`) for sample calls to products, cart, checkout (with/without discount), and admin endpoints.

Configuration:

- `DISCOUNT_INTERVAL` (default `3`) controls which order numbers can receive a code.
- `PORT` (default `3000`) backend port.

## API surface

- `GET /api/products` — catalog.
- `GET /api/cart/:userId` — current cart.
- `POST /api/cart/:userId/items` — add an item. Body: `{ "productId": "p1", "quantity": 2 }`.
- `POST /api/cart/:userId/checkout` — place order. Body: `{ "discountCode": "SAVE-..." }` (optional).
- `POST /api/admin/discounts` — generate a 10% code when the next order number is divisible by `DISCOUNT_INTERVAL`.
- `GET /api/admin/metrics` — totals (items purchased, net purchase amount, total discount, codes with status).

Notes:

- Codes are valid only for their eligible order number and expire afterward. Only one active code exists at a time.
- Orders and carts are stored in-memory; restart wipes state.

## Testing

```bash
npm test
```

Unit tests cover cart + checkout rules. HTTP route tests automatically skip when the environment blocks opening a local port (common in sandboxes); they run normally on a laptop/CI.

## Project structure

- `src/` — Express app, services, config.
- `tests/` — Jest + ts-jest test suites.
- `client/` — Vite React UI hitting the same APIs.

## UI preview

The UI highlights catalog, cart, checkout with code entry, and admin metrics with code generation. A simple proxy in `client/vite.config.ts` forwards `/api` to `localhost:3000` for local development.
