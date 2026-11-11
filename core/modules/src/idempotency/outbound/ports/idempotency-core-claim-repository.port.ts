import type { Nullable } from '@acme-libs/toolkit';

import type { IdempotencyCoreClaimInsertOutcomeEnum } from '../enums/idempotency-core-claim-insert-outcome.enum';
import type { IIdempotencyCoreClaimInsertQuery, IIdempotencyCoreClaimRecord } from '../interfaces';

export interface IIdempotencyCoreClaimRepositoryPort {
  insert(query: IIdempotencyCoreClaimInsertQuery): Promise<IdempotencyCoreClaimInsertOutcomeEnum>;
  findByKey(key: string): Promise<Nullable<IIdempotencyCoreClaimRecord>>;
}

export const IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT',
);
