import { Module } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_KEY_PORT,
  IDEMPOTENCY_CORE_PURGE_PORT,
} from '@acme-core/contracts/idempotency';
import {
  IdempotencyCoreClaimUseCase,
  IdempotencyCoreCompleteUseCase,
  IdempotencyCorePurgeExpiredUseCase,
  IdempotencyCoreReleaseUseCase,
} from '../application';
import {
  IdempotencyCoreClaimRepository,
  IdempotencyCoreCompleteRepository,
  IdempotencyCorePurgeExpiredRepository,
  IdempotencyCoreReleaseRepository,
  IdempotencyCoreTypeOrmModule,
} from '../infrastructure';
import {
  IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
  IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
  IDEMPOTENCY_CORE_PURGE_EXPIRED_REPOSITORY_PORT,
  IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
} from '../outbound';
import { IdempotencyCoreKeyFacade } from './idempotency-core-key.facade';
import { IdempotencyCorePurgeFacade } from './idempotency-core-purge.facade';

@Module({
  imports: [IdempotencyCoreTypeOrmModule.forFeature()],
  exports: [IDEMPOTENCY_CORE_KEY_PORT, IDEMPOTENCY_CORE_PURGE_PORT],
  providers: [
    { provide: IDEMPOTENCY_CORE_KEY_PORT, useClass: IdempotencyCoreKeyFacade },
    { provide: IDEMPOTENCY_CORE_PURGE_PORT, useClass: IdempotencyCorePurgeFacade },
    IdempotencyCoreClaimUseCase,
    IdempotencyCoreCompleteUseCase,
    IdempotencyCorePurgeExpiredUseCase,
    IdempotencyCoreReleaseUseCase,
    {
      provide: IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
      useClass: IdempotencyCoreClaimRepository,
    },
    {
      provide: IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
      useClass: IdempotencyCoreCompleteRepository,
    },
    {
      provide: IDEMPOTENCY_CORE_PURGE_EXPIRED_REPOSITORY_PORT,
      useClass: IdempotencyCorePurgeExpiredRepository,
    },
    {
      provide: IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
      useClass: IdempotencyCoreReleaseRepository,
    },
  ],
})
export class IdempotencyCoreModule {}
