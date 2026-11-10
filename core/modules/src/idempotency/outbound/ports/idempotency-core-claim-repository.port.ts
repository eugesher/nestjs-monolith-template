import { Nullable } from '@acme-libs/toolkit';

import { IdempotencyCoreClaimInsertOutcomeEnum } from '../enums/idempotency-core-claim-insert-outcome.enum';
import { IIdempotencyCoreClaimInsertQuery, IIdempotencyCoreClaimRecord } from '../interfaces';

export interface IIdempotencyCoreClaimRepositoryPort {
  insert(query: IIdempotencyCoreClaimInsertQuery): Promise<IdempotencyCoreClaimInsertOutcomeEnum>;
  findByKey(key: string): Promise<Nullable<IIdempotencyCoreClaimRecord>>;
}

export const IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT',
);
