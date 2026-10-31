INSERT INTO ledger_entry (
  id,
  operation_key,
  subject_type,
  subject_id,
  action,
  payload,
  correlation_id,
  occurred_at,
  recorded_at
)
VALUES
  (
    400,
    'product-created:100',
    'product',
    '100',
    'ProductCreated',
    '{"sku": "SKU-0001", "name": "Seeded reference product"}',
    'seed-correlation-id',
    '2026-01-01 00:00:00.000',
    '2026-01-01 00:00:00.000'
  ),
  (
    401,
    'product-created:101',
    'product',
    '101',
    'ProductCreated',
    '{"sku": "SKU-0002", "name": "Seeded draft product"}',
    'seed-correlation-id',
    '2026-01-01 00:00:00.000',
    '2026-01-01 00:00:00.000'
  );
