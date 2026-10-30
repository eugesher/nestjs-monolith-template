import { Module } from '@nestjs/common';

import { IDEMPOTENCY_CORE_KEY_PORT } from '@acme-core/contracts/idempotency';
import {
  IdempotencyCoreClaimUseCase,
  IdempotencyCoreCompleteUseCase,
  IdempotencyCoreReleaseUseCase,
} from '../application';
import {
  IdempotencyCoreClaimRepository,
  IdempotencyCoreCompleteRepository,
  IdempotencyCoreReleaseRepository,
  IdempotencyCoreTypeOrmModule,
} from '../infrastructure';
import {
  IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
  IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
  IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
} from '../outbound';
import { IdempotencyCoreKeyFacade } from './idempotency-core-key.facade';

@Module({
  imports: [IdempotencyCoreTypeOrmModule.forFeature()],
  exports: [IDEMPOTENCY_CORE_KEY_PORT],
  providers: [
    { provide: IDEMPOTENCY_CORE_KEY_PORT, useClass: IdempotencyCoreKeyFacade },
    IdempotencyCoreClaimUseCase,
    IdempotencyCoreCompleteUseCase,
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
      provide: IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
      useClass: IdempotencyCoreReleaseRepository,
    },
  ],
})
export class IdempotencyCoreModule {}
