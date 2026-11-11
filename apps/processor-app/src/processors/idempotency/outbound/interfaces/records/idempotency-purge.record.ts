import type { Nullable } from '@acme-libs/toolkit';

export interface IIdempotencyPurgeRecord {
  affected?: Nullable<number>;
}
