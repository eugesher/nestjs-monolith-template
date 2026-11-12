import type { IdempotencyStatusEnum } from '@acme-libs/kernel';
import type { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyCoreKeyDraftOutput {
  scope: string;
  key: string;
  requestFingerprint: string;
  status: IdempotencyStatusEnum;
  responseBody: Nullable<string>;
}
