# Symmes Fleet Parking & Repair

Online booking for 300 truck/trailer/fleet parking spots + a mechanic service request form, for
Symmes Fleet Parking & Repair (Fairfield, OH).

## Stack

- **Frontend**: Next.js (TypeScript, App Router, Tailwind CSS) → deployed on **Vercel**
- **Backend**: Spring Boot (Java 17) + PostgreSQL → deployed on **Railway** (Vercel cannot run a
  long-running Java server, so the API lives on Railway and the frontend calls it over HTTPS)
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
mvn spring-boot:run
```
(requires a local Postgres matching the `PGHOST`/`PGPORT`/etc defaults in `application.yml`, or
override them as env vars).

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

## Deployment

### Backend → Railway
1. Create a new Railway project, add a **PostgreSQL** plugin.
2. Add a service from this repo with **Root Directory = `backend`** and **Watch Paths = `backend/**`**.
   Railway will build it via the included `Dockerfile` (see `backend/railway.json`).
3. Link the Postgres plugin's variables to the backend service as `PGHOST`, `PGPORT`, `PGDATABASE`,
   `PGUSER`, `PGPASSWORD`.
4. Set additional env vars: `JWT_SECRET` (long random string), `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `ALLOWED_ORIGINS` (your Vercel domain, e.g.
   `https://symmesfleet.com`), and `ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD` for the
   first admin login (change the password after first login by rotating this bootstrap — there is
   no in-app "change password" flow yet).
5. Confirm `/actuator/health` responds once deployed.

### Frontend → Vercel
1. Import this repo into Vercel with **Root Directory = `frontend`**.
2. Set env vars: `NEXT_PUBLIC_API_BASE_URL` (your Railway backend URL) and
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Deploy — Next.js is auto-detected, no `vercel.json` needed.

### Stripe webhook (production)
Register `https://<your-railway-backend>/api/webhooks/stripe` in the Stripe Dashboard → Webhooks,
subscribed to `payment_intent.succeeded` and `payment_intent.payment_failed`. Copy the signing
secret into Railway's `STRIPE_WEBHOOK_SECRET`.

## How booking availability & payment work

- Selecting a spot + date range creates a `PENDING_PAYMENT` booking that holds the spot for 15
  minutes while Stripe payment completes.
- A Postgres `EXCLUDE` constraint (not just application logic) guarantees two active bookings can
  never overlap for the same spot, even under concurrent requests.
- A scheduled job expires abandoned holds every minute, freeing the spot back up.
- The Stripe webhook is the source of truth for confirming payment; the confirmation page just
  reflects Stripe's redirect status.
