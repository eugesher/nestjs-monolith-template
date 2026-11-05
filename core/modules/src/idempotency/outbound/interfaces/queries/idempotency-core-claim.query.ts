import { IdempotencyKey } from '@acme-core/entities';

export type IIdempotencyCoreClaimInsertQuery = Pick<
  IdempotencyKey,
  'idempotencyKey' | 'requestFingerprint' | 'status' | 'responseBody'
>;
