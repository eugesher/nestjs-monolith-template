INSERT INTO product (id, sku, name, status, version, created_at, updated_at)
VALUES
  (
    100,
    'SKU-0001',
    'Seeded reference product',
    'active',
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  ),
  (
    101,
    'SKU-0002',
    'Seeded draft product',
    'draft',
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  ),
  (
    102,
    'SKU-0003',
    'Product to rename',
    'draft',
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  ),
  (
    103,
    'SKU-0004',
    'Product to archive',
    'active',
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  ),
  (
    104,
    'SKU-0005',
    'Product under concurrent renames',
    'draft',
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  ),
  (
    105,
    'SKU-0006',
    'Archived product',
    'archived',
    2,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  ),
  (
    106,
    'SKU-0007',
    'Sold out product',
    'active',
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00'
  );
