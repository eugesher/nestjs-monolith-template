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
    'item-created:100',
    'item',
    '100',
    'ItemCreated',
    '{"sku": "SKU-0001", "name": "Seeded reference item", "ownerId": "00000000-0000-4000-8000-000000000102"}',
    'seed-correlation-id',
    '2026-01-01 00:00:00.000',
    '2026-01-01 00:00:00.000'
  ),
  (
    401,
    'item-created:101',
    'item',
    '101',
    'ItemCreated',
    '{"sku": "SKU-0002", "name": "Seeded draft item", "ownerId": "00000000-0000-4000-8000-000000000102"}',
    'seed-correlation-id',
    '2026-01-01 00:00:00.000',
    '2026-01-01 00:00:00.000'
  );
