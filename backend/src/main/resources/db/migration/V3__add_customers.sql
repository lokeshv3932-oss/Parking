CREATE TABLE customer (
    id                              BIGSERIAL PRIMARY KEY,
    email                           VARCHAR(255) NOT NULL UNIQUE,
    password_hash                   VARCHAR(255) NOT NULL,
    email_verified                  BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token              VARCHAR(255),
    verification_token_expires_at   TIMESTAMPTZ,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_verification_token ON customer (verification_token);

ALTER TABLE booking ADD COLUMN customer_id BIGINT REFERENCES customer(id);
ALTER TABLE mechanic_request ADD COLUMN customer_id BIGINT REFERENCES customer(id);

CREATE INDEX idx_booking_customer ON booking (customer_id);
CREATE INDEX idx_mechanic_request_customer ON mechanic_request (customer_id);
