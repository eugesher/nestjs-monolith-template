import { IIdempotencyPurgeRecord } from '../interfaces';

export interface IIdempotencyPurgeRepositoryPort {
  deleteCreatedBefore(cutoff: Date): Promise<IIdempotencyPurgeRecord>;
}

export const IDEMPOTENCY_PURGE_REPOSITORY_PORT = Symbol('IDEMPOTENCY_PURGE_REPOSITORY_PORT');
