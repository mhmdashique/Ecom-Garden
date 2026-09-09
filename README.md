# Verdant - Plant Marketing & Selling Platform

Full-stack e-commerce for plants.

## Tech Stack
- Frontend: React 18 + Vite + React Router + Context API + Tailwind CSS + Axios
- Backend: Node.js + Express + Supabase (PostgreSQL) + JWT + bcrypt
- Storage: Supabase Storage (plant images)

## Structure
```
backend/  Express API (supabase.sql for schema)
frontend/ React Vite app
```

## Setup

### 1. Supabase
- Create project at supabase.com
- Run `backend/supabase.sql` in SQL editor
- Create public bucket `plant-images`
- Copy URL + anon/service keys to `backend/.env`

### 2. Backend
```bash
cd backend
cp .env.example .env  # fill Supabase keys
npm install
npm run dev  # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev  # http://localhost:5173
```

## Demo Accounts
- Admin: admin@greennest.com / admin123  (seeded in memoryStore.js, login via /admin/login)
- User: register new account (includes Geolocation "Get Current Location" reverse-geocode via Nominatim)

## Features Implemented
- Public: Landing (hero, categories, best sellers, testimonials, newsletter), About, Shop (filters, search, sort, pagination), Plant Detail (gallery zoom, care, reviews, related), Cart & Checkout, Contact with Google Map
- Auth: Register (full validation + geolocation autofill), Login, Forgot password mock, JWT + bcrypt
- User Dashboard: profile edit, password change, orders, addresses
- Admin: separate /admin/login, analytics, plant CRUD, order status updates, user block/unblock, contact messages
- Backend: rate-limit, helmet, morgan, JWT auth + role guard, Supabase fallback to in-memory for demo

## API
See Section 5 in prompt: `/api/auth/*`, `/api/plants`, `/api/cart`, `/api/orders`, `/api/reviews`, `/api/contact`, `/api/users/profile`, `/api/admin/*`
