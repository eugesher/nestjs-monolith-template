import { Nullable } from '@acme-libs/toolkit';

import { IIdempotencyCoreKeyDraft, IdempotencyCoreKeyModel } from '../../domain';

export interface IIdempotencyCoreClaimRepositoryPort {
  insert(draft: IIdempotencyCoreKeyDraft): Promise<boolean>;
  findByKey(key: string): Promise<Nullable<IdempotencyCoreKeyModel>>;
}

export const IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT = Symbol(
  'IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT',
);
