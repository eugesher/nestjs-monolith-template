import type { IdempotencyKey } from '@acme-core/entities';

export type IIdempotencyCoreClaimInsertQuery = Pick<
  IdempotencyKey,
  'scope' | 'idempotencyKey' | 'requestFingerprint' | 'status' | 'responseBody'
>;

export interface IIdempotencyCoreClaimFindQuery {
  scope: string;
  key: string;
}
