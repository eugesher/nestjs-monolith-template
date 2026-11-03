import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyCoreKeyInsertCommand {
  idempotencyKey: string;
  requestFingerprint: string;
  status: IdempotencyStatusEnum;
  responseBody: Nullable<string>;
}
