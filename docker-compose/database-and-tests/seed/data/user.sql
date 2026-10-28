INSERT INTO `user` (id, email, password_hash, status, created_at)
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'admin@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$8cqzQEjMoy+N92EXjrPCSQ$V024g5qa/PB/ic5ixCW54cqxgDJYie7Uve9hEHSRfhk',
    'active',
    '2026-01-01 00:00:00'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'editor@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$WUxQhCokZyulMVx4zvRvHQ$wdHZdtKR7PT3Y0jJ5UeRYvKBDNEgKPvl10bkCrCKeso',
    'active',
    '2026-01-01 00:00:00'
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'viewer@example.com',
    '$argon2id$v=19$m=19456,p=1,t=2$fzTVv6Cc9RuWhnM5aV8ueQ$ZikhYwgRND+UmXcAzRnECW3bS4P+eZBr+b3Qednrwqc',
    'active',
    '2026-01-01 00:00:00'
  );
