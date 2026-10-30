export interface IIdempotencyCorePurgeExpiredRepositoryPort {
  deleteCreatedBefore(cutoff: Date): Promise<number>;
}

export const IDEMPOTENCY_CORE_PURGE_EXPIRED_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_PURGE_EXPIRED_REPOSITORY_PORT',
);
