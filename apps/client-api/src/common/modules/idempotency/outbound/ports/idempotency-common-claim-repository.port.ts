import { Maybe } from '@acme-libs/toolkit';
import { IdempotencyCommonKeyModel } from '../../domain';

export interface IIdempotencyCommonClaimRepositoryPort {
  insert(key: IdempotencyCommonKeyModel): Promise<boolean>;
  findByKey(key: string): Promise<Maybe<IdempotencyCommonKeyModel>>;
}

export const IDEMPOTENCY_COMMON_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_COMMON_CLAIM_REPOSITORY_PORT',
);
