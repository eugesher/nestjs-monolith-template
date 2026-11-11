import type { IdempotencyKey } from '@acme-core/entities';

export type IIdempotencyCoreClaimRecord = Pick<
  IdempotencyKey,
  'id' | 'requestFingerprint' | 'status' | 'responseBody'
>;
