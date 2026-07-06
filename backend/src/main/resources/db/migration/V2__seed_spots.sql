-- 300 total spots: 1-200 TRUCK, 201-270 TRAILER, 271-300 FLEET_VEHICLE
INSERT INTO parking_spot (spot_number, spot_type, monthly_rate_cents, daily_rate_cents, active)
SELECT
    'S-' || LPAD(n::TEXT, 3, '0'),
    CASE
        WHEN n <= 200 THEN 'TRUCK'
        WHEN n <= 270 THEN 'TRAILER'
        ELSE 'FLEET_VEHICLE'
    END,
    CASE
        WHEN n <= 200 THEN 15000
        WHEN n <= 270 THEN 12000
        ELSE 20000
    END,
    CASE
        WHEN n <= 200 THEN 700
        WHEN n <= 270 THEN 600
        ELSE 900
    END,
    TRUE
FROM generate_series(1, 300) AS n;
