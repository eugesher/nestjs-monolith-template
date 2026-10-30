import { Maybe } from '@acme-libs/toolkit';
import { IdempotencyCoreKeyModel } from '../../domain';

export interface IIdempotencyCoreClaimRepositoryPort {
  insert(key: IdempotencyCoreKeyModel): Promise<boolean>;
  findByKey(key: string): Promise<Maybe<IdempotencyCoreKeyModel>>;
}

export const IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT',
);
