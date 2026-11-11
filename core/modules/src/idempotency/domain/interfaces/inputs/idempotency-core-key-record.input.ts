import type { IdempotencyStatusEnum } from '@acme-libs/kernel';
import type { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyCoreKeyRecordInput {
  requestFingerprint: string;
  status: IdempotencyStatusEnum;
  responseBody: Nullable<string>;
}
