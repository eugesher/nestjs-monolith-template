import { Nullable } from '@acme-libs/toolkit';

import { IIdempotencyCoreClaimInsertQuery, IIdempotencyCoreClaimRecord } from '../interfaces';

export interface IIdempotencyCoreClaimRepositoryPort {
  insert(query: IIdempotencyCoreClaimInsertQuery): Promise<void>;
  findByKey(key: string): Promise<Nullable<IIdempotencyCoreClaimRecord>>;
}

export const IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT',
);
