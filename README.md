# Symmes Fleet Parking & Repair

Online booking for 300 truck/trailer/fleet parking spots + a mechanic service request form, for
Symmes Fleet Parking & Repair (Fairfield, OH).

## Stack

- **Frontend**: Next.js (TypeScript, App Router, Tailwind CSS) → deployed on **Vercel** (free tier)
- **Backend**: Spring Boot (Java 17) → deployed on **Render** (free tier; Vercel cannot run a
  long-running Java server, so the API lives on Render and the frontend calls it over HTTPS)
- **Database**: PostgreSQL → hosted on **Neon** (free tier, no time limit)
- **Payments**: Stripe (PaymentIntents + webhook confirmation)
- **Auth**: JWT-based admin/staff login (no customer accounts — booking and mechanic requests are
  public forms)

```
/frontend   Next.js app
/backend    Spring Boot app
```

## Local development

### Prerequisites
- Java 17+ and Maven 3.9+
- Node.js 18+ and npm
- Docker (for local Postgres via docker-compose, or Testcontainers-based tests)
- A Stripe account (test mode keys are enough for local dev)

### 1. Start Postgres + backend

```bash
STRIPE_SECRET_KEY=sk_test_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx docker compose up --build
```

This starts Postgres on `5432` and the backend on `8080`, running Flyway migrations automatically
(schema + the 300 seeded parking spots) and bootstrapping an admin user `admin` / `changeme123`
(override via the `ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD` env vars in
`docker-compose.yml` — do this before deploying anywhere real).

To run the backend directly instead (e.g. for faster iteration):
```bash
cd backend
PGSSLMODE=disable mvn spring-boot:run
```
(requires a local Postgres matching the `PGHOST`/`PGPORT`/etc defaults in `application.yml`, or
override them as env vars; `PGSSLMODE=disable` is only needed because local Postgres isn't set up
for SSL — the production default is `require`, which Neon needs).

### 2. Start the frontend

```bash
cd frontend
cp .env.example .env.local   # then fill in NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npm install
npm run dev
```

Visit `http://localhost:3000`. The admin dashboard is at `/admin/login`.

### 3. Stripe webhook locally

Use the Stripe CLI to forward events to your local backend:
```bash
stripe listen --forward-to localhost:8080/api/webhooks/stripe
```
Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### Running backend tests

```bash
cd backend
mvn test
```
The booking-overlap and webhook-idempotency tests use Testcontainers, so Docker must be running.

## Deployment (all free-tier)

### Database → Neon
1. Create a free project at [neon.tech](https://neon.tech).
2. From the project dashboard, grab the connection details: host, database name, username,
   password (Neon shows a full connection string — pull the pieces out of it).

### Backend → Render
1. Create a free account at [render.com](https://render.com) and connect your GitHub account.
2. New → Web Service → pick this repo → set **Root Directory = `backend`**, **Environment =
   Docker** (it builds via the included `Dockerfile`), **Instance Type = Free**.
3. Set env vars: `PGHOST`, `PGPORT` (usually `5432`), `PGDATABASE`, `PGUSER`, `PGPASSWORD` (from
   Neon), `JWT_SECRET` (long random string), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `ALLOWED_ORIGINS` (your Vercel domain, e.g. `https://symmesfleet.vercel.app`), and
   `ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD` for the first admin login (change the
   password after first login by rotating this bootstrap — there is no in-app "change password"
   flow yet). `PGSSLMODE` does not need to be set — it defaults to `require`, which Neon needs.
4. Confirm `/actuator/health` responds once deployed, at your Render-assigned URL
   (`https://<service>.onrender.com`).
5. Free-tier caveat: the service spins down after ~15 minutes idle and takes 30–50s to wake on
   the next request. Fine for low traffic; the first visitor after a quiet period just waits a bit.

### Frontend → Vercel
1. Import this repo into Vercel with **Root Directory = `frontend`**.
2. Set env vars: `NEXT_PUBLIC_API_BASE_URL` (your Render backend URL) and
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Deploy — Next.js is auto-detected, no `vercel.json` needed.

### Stripe webhook (production)
Register `https://<your-render-backend>/api/webhooks/stripe` in the Stripe Dashboard → Webhooks,
subscribed to `payment_intent.succeeded` and `payment_intent.payment_failed`. Copy the signing
secret into Render's `STRIPE_WEBHOOK_SECRET`.

## How booking availability & payment work

- Selecting a spot + date range creates a `PENDING_PAYMENT` booking that holds the spot for 15
  minutes while Stripe payment completes.
- A Postgres `EXCLUDE` constraint (not just application logic) guarantees two active bookings can
  never overlap for the same spot, even under concurrent requests.
- A scheduled job expires abandoned holds every minute, freeing the spot back up.
- The Stripe webhook is the source of truth for confirming payment; the confirmation page just
  reflects Stripe's redirect status.
