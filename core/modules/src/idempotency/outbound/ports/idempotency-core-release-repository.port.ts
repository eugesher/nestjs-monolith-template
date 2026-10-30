export interface IIdempotencyCoreReleaseRepositoryPort {
  deleteInFlight(key: string): Promise<void>;
}

export const IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT',
);
