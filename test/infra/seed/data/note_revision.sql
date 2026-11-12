INSERT INTO note_revision (
  id,
  note_id,
  note_version,
  body_before,
  body_after,
  editor_id,
  correlation_id,
  recorded_at
)
VALUES
  (
    200,
    202,
    2,
    'Handled soon.',
    'Already handled.',
    1,
    '5eed0000-0000-4000-8000-000000000001',
    '2026-01-01 00:00:00.000'
  );
