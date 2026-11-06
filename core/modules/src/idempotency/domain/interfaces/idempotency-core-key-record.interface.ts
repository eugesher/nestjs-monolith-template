import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyCoreKeyRecord {
  requestFingerprint: string;
  status: IdempotencyStatusEnum;
  responseBody: Nullable<string>;
}
