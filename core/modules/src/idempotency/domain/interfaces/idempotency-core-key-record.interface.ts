import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyCoreKeyRecord {
  id: string;
  key: string;
  requestFingerprint: string;
  status: IdempotencyStatusEnum;
  responseBody: Nullable<string>;
  createdAt: Date;
}
