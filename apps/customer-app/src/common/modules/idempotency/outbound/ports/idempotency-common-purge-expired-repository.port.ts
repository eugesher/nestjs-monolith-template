export interface IIdempotencyCommonPurgeExpiredRepositoryPort {
  deleteCreatedBefore(cutoff: Date): Promise<number>;
}

export const IDEMPOTENCY_COMMON_PURGE_EXPIRED_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_COMMON_PURGE_EXPIRED_REPOSITORY_PORT',
);
