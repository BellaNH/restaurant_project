# Restaurant Ordering System

Full-stack restaurant ordering app (React + Vite, Node/Express, MongoDB, Stripe).

## Table of Contents
- Overview
- Architecture
- Tech Stack
- Getting Started
- Configuration (Env Vars)
- Scripts
- API Surface (summary)
- Testing
- Documentation
- Contributing & Support
- License

## Overview
- Users: browse menu, filter by category, add to cart, checkout with Stripe, track orders.
- Admins: manage food items, categories, and orders (protected routes).
- Auth: JWT + email verification + OTP for password reset.

## Architecture
- Frontend: React 19, Vite, React Router, Context for state, React.lazy for code splitting.
- Backend: Node/Express, MongoDB (Mongoose), Stripe checkout, Nodemailer, validation middleware.
- Security: JWT auth, admin middleware, rate limiting on auth, validation/sanitization, schema validation, error handling middleware.

## Tech Stack
- Frontend: React, Vite, react-router-dom, react-toastify, react-icons.
- Backend: Express, Mongoose, Stripe, Nodemailer, JWT, Multer, validator, rate-limit.
- Tooling: Jest + Supertest (backend tests), ESLint, Tailwind (styles), dotenv.

## Getting Started
Prereqs: Node 16+, MongoDB, Stripe account, Gmail (app password).

Clone and install:
```bash
git clone <repo-url>
cd restaurant_project
```

Backend:
```bash
cd backend
npm install
cp env.example .env  # fill values
npm run server       # dev
# npm start          # prod
```

Frontend:
```bash
cd frontend
npm install
cp env.example .env.local  # set VITE_API_URL
npm run dev
```

## Configuration (Env Vars)
Backend `.env`:
- `MONGO_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `SMTP_USER`, `SMTP_PASS`, `SENDER_EMAIL`
- `ALLOWED_ORIGINS` (comma-separated)
- `FRONTEND_URL`

Frontend `.env.local`:
- `VITE_API_URL`

See `ENVIRONMENT_SETUP.md` for details and examples.

## Scripts
Backend:
- `npm run server` (dev, nodemon)
- `npm start` (prod)
- `npm test` (Jest + Supertest)

Frontend:
- `npm run dev`
- `npm run build`
- `npm run preview`

## API Surface (summary)
- Auth: `POST /api/auth/register`, `/login`, `/logout`, `/verify-account`, `/send-verify-otp`, `/send-reset-otp`, `/reset-password`
- Food: `GET /api/food/list` (paginated), `POST /api/food/add|edit|remove` (admin)
- Categories: `GET /api/category/list`, `POST /api/category/addCategory|editCategory|removeCategory` (admin)
- Orders: `POST /api/order/placeorder`, `/verifyorder`, `/myorders`, `/allorders` (admin), `/status` (admin)
- Cart: `POST /cart/add|remove|get`

## Testing
- Backend: `npm test` (Jest + Supertest). App exported via `app.js`; sample test in `backend/tests/health.test.js`.
- Frontend: (to add) — suggest React Testing Library for pages/components.

## Documentation
- Environment: `ENVIRONMENT_SETUP.md`
- Auth: `AUTHENTICATION_STRATEGY.md`
- Validation: `VALIDATION_GUIDE.md`
- Database: `DATABASE_SECURITY.md`
- Roadmap: `PROJECT_IMPROVEMENT_PHASES.md`

## Contributing & Support
- Open issues/PRs with clear context and steps to reproduce.
- Run tests before submitting.
- Follow existing structure and validations.

## License
ISC

