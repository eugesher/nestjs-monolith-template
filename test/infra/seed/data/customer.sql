INSERT INTO customer (id, email, password_hash, status, created_at)
VALUES
  (
    '00000000-0000-4000-8000-000000000101',
    'ann@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$gdh4jnZQU6q4zE34ysIfKQ$skjWNN9dbse+A+W5MZ00GTc+LO7vtrlxtBnp0FPQFCU',
    'active',
    '2026-01-01 00:00:00'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'bob@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$o6quUsI85mW4PkRV5wyNcw$aFL2hKTbSh/lZQH+6G5HccLO5fjVV/WCYsedw81QJU4',
    'active',
    '2026-01-01 00:00:00'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    'carol@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$cIyAxB93G580hg9549t3NQ$4dcEWEfj/Np1D/KbWZuM2MXPapPgFWpn3ib5yoKWIQI',
    'active',
    '2026-01-01 00:00:00'
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    'dora@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$HcHuoPUJyZ+dE81EthoFpA$+7lzXjlwrF7uYoqFhHh36xtzSjGP9kDsEOlcyKhzU6Q',
    'disabled',
    '2026-01-01 00:00:00'
  );
