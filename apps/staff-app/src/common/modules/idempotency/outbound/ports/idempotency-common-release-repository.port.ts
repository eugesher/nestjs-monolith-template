export interface IIdempotencyCommonReleaseRepositoryPort {
  deleteInFlight(key: string): Promise<void>;
}

export const IDEMPOTENCY_COMMON_RELEASE_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_COMMON_RELEASE_REPOSITORY_PORT',
);
