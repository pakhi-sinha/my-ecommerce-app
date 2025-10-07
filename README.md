# E-commerce App (Products, Cart, Checkout, Confirmation)

A full-stack E-commerce web application built with a modular architecture, featuring product listings, shopping cart functionality, a secure checkout flow, and order confirmation.
The project is containerized with Docker and easily deployable to Render, using MongoDB Atlas for cloud database management.

# Features:

Dynamic product catalog with details and pricing

Session-based cart management

Secure checkout and order confirmation

Persistent data with MongoDB

Environment-ready configuration for local and cloud setups

Dockerized backend, frontend, and database services

# Tech Stack

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express

Database: MongoDB (local or Atlas)

Containerization: Docker, Docker Compose

Deployment: Render


## Local Development

- Prereqs: Docker + Docker Compose
- Start stack:

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3001
- MongoDB: mongodb://localhost:27017 (exposed from the `database` service)

## Environment

Backend uses these variables:
- `MONGO_URI` (default: mongodb://database:27017/e-commerce via compose)
- `SESSION_SECRET` (set in compose)
- `PORT` (default 3001)

## Deployment (Render + MongoDB Atlas)

1. Create a free MongoDB Atlas cluster and get the connection string. Allow Render egress IPs or allow 0.0.0.0/0 for testing only.
2. Create a Web Service on Render from this repo for the backend:
   - Runtime: Docker
   - Root Directory: `Backend`
   - Build Command: `docker build -t ecommerce-backend .`
   - Start Command: `node server.js`
   - Env Vars:
     - `MONGO_URI`: your Atlas URI
     - `SESSION_SECRET`: generate a strong secret
     - `PORT`: 3001
3. Create a Static Site on Render for the frontend from `Frontend/`.
   - No build command. Publish path: `Frontend`.
   - After deploy, update `Frontend/config.js` to point to your backend domain if on a different origin, or put a reverse-proxy in front.

## Prompt Architecture Notes

- We worked iteratively in stages:
  1) UI scaffolding and API contracts
  2) Backend API and business logic
  3) Database schema and persistence
  4) Session-backed cart, checkout, confirmation
- Frontend uses `window.__CONFIG__.API_BASE` to switch between local and deployed origins.
- Session cookies are enabled via `credentials: 'include'` in fetches and a session store in MongoDB.

## Endpoints

- `GET /api/products` → list products
- `GET /api/products/:id` → single product
- `GET /api/cart` → session cart
- `POST /api/cart` → add `{ productId, quantity }`
- `PUT /api/cart/:productId` → set `{ quantity }` or remove when `<=0`
- `DELETE /api/cart/:productId` → remove item
- `POST /api/checkout` → create order, returns order payload

## Notes
- The backend seeds products on first boot if the collection is empty.
- CORS is enabled with credentials; ensure frontend origin is allowed in production.
