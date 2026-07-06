CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE parking_spot (
    id                  BIGSERIAL PRIMARY KEY,
    spot_number         VARCHAR(20) NOT NULL UNIQUE,
    spot_type           VARCHAR(20) NOT NULL,
    monthly_rate_cents  INTEGER NOT NULL,
    daily_rate_cents    INTEGER NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE bookingstatus AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

CREATE TABLE booking (
    id                       BIGSERIAL PRIMARY KEY,
    spot_id                  BIGINT NOT NULL REFERENCES parking_spot(id),
    start_date               DATE NOT NULL,
    end_date                 DATE NOT NULL,
    customer_name            VARCHAR(255) NOT NULL,
    customer_email           VARCHAR(255) NOT NULL,
    customer_phone           VARCHAR(50),
    vehicle_info             VARCHAR(255),
    amount_cents             INTEGER NOT NULL,
    status                   bookingstatus NOT NULL DEFAULT 'PENDING_PAYMENT',
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    hold_expires_at          TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_booking_dates CHECK (start_date < end_date),

    CONSTRAINT no_overlapping_active_bookings
        EXCLUDE USING gist (
            spot_id WITH =,
            daterange(start_date, end_date, '[)') WITH &&
        ) WHERE (status IN ('PENDING_PAYMENT', 'CONFIRMED'))
);

CREATE INDEX idx_booking_spot_dates ON booking (spot_id, start_date, end_date);
CREATE INDEX idx_booking_hold_expiry ON booking (hold_expires_at) WHERE status = 'PENDING_PAYMENT';
CREATE INDEX idx_bookingstatus ON booking (status);

CREATE TYPE mechanicrequeststatus AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE mechanic_request (
    id                  BIGSERIAL PRIMARY KEY,
    customer_name       VARCHAR(255) NOT NULL,
    customer_email      VARCHAR(255) NOT NULL,
    customer_phone      VARCHAR(50) NOT NULL,
    vehicle_info        VARCHAR(255) NOT NULL,
    issue_description   TEXT NOT NULL,
    preferred_date      DATE,
    status              mechanicrequeststatus NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mechanicrequeststatus ON mechanic_request (status);

CREATE TABLE admin_user (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(30) NOT NULL DEFAULT 'ROLE_ADMIN',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
