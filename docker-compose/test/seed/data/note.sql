INSERT INTO note (
  id,
  subject_type,
  subject_id,
  body,
  author_id,
  resolved,
  version,
  created_at,
  updated_at,
  deleted_at
)
VALUES
  (
    200,
    'item',
    '100',
    'Customer called about this.',
    '00000000-0000-4000-8000-000000000001',
    0,
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
    NULL
  ),
  (
    201,
    'item',
    '100',
    'Check the supplier.',
    '00000000-0000-4000-8000-000000000001',
    0,
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
    NULL
  ),
  (
    202,
    'item',
    '101',
    'Already handled.',
    '00000000-0000-4000-8000-000000000001',
    1,
    2,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
    NULL
  ),
  (
    203,
    'ticket',
    'T-1',
    'Edited while a revision is taken.',
    '00000000-0000-4000-8000-000000000001',
    0,
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
    NULL
  ),
  (
    204,
    'ticket',
    'T-2',
    'Edited with the same body.',
    '00000000-0000-4000-8000-000000000001',
    0,
    1,
    '2026-01-01 00:00:00',
    '2026-01-01 00:00:00',
    NULL
  );
