import { IIdempotencyPurgeKeyDeletedRecord } from '../interfaces';

export interface IIdempotencyPurgeRunRepositoryPort {
  deleteCreatedBefore(cutoff: Date): Promise<IIdempotencyPurgeKeyDeletedRecord>;
}

export const IDEMPOTENCY_PURGE_RUN_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_PURGE_RUN_REPOSITORY_PORT',
);
