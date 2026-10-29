import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyCommonKeyRecord {
  id: string;
  key: string;
  requestFingerprint: string;
  status: IdempotencyStatusEnum;
  responseBody: Nullable<string>;
  createdAt: Date;
}
