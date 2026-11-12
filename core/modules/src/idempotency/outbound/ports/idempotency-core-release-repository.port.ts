import type { IIdempotencyCoreReleaseQuery } from '../interfaces';

export interface IIdempotencyCoreReleaseRepositoryPort {
  deleteInFlight(query: IIdempotencyCoreReleaseQuery): Promise<void>;
}

export const IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT',
);
