import { IdempotencyKey } from '@acme-core/entities';

export type IIdempotencyCoreClaimRecord = Pick<
  IdempotencyKey,
  'id' | 'idempotencyKey' | 'requestFingerprint' | 'status' | 'responseBody' | 'createdAt'
>;
