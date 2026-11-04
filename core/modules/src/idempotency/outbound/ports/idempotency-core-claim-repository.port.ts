import { Nullable } from '@acme-libs/toolkit';

import { IIdempotencyCoreKeyFoundRecord, IIdempotencyCoreKeyInsertQuery } from '../interfaces';

export interface IIdempotencyCoreClaimRepositoryPort {
  insert(query: IIdempotencyCoreKeyInsertQuery): Promise<void>;
  findByKey(key: string): Promise<Nullable<IIdempotencyCoreKeyFoundRecord>>;
}

export const IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT',
);
