import { Module } from '@nestjs/common';

import { IDEMPOTENCY_COMMON_PORT } from '@acme-customer-contracts/idempotency';
import { ConfigProviderHelper } from '@acme-libs/config';
import {
  IdempotencyCommonClaimUseCase,
  IdempotencyCommonCompleteUseCase,
  IdempotencyCommonPurgeExpiredUseCase,
  IdempotencyCommonReleaseUseCase,
} from '../application';
import {
  IdempotencyCommonClaimRepository,
  IdempotencyCommonCompleteRepository,
  IdempotencyCommonPurgeExpiredRepository,
  IdempotencyCommonReleaseRepository,
  IdempotencyCommonTypeOrmModule,
} from '../infrastructure';
import {
  IDEMPOTENCY_COMMON_CLAIM_REPOSITORY_PORT,
  IDEMPOTENCY_COMMON_COMPLETE_REPOSITORY_PORT,
  IDEMPOTENCY_COMMON_KEY_TTL_HOURS,
  IDEMPOTENCY_COMMON_PURGE_EXPIRED_REPOSITORY_PORT,
  IDEMPOTENCY_COMMON_RELEASE_REPOSITORY_PORT,
} from '../outbound';
import { IdempotencyCommonFacade } from './idempotency-common.facade';

@Module({
  imports: [IdempotencyCommonTypeOrmModule.forFeature()],
  exports: [IDEMPOTENCY_COMMON_PORT],
  providers: [
    { provide: IDEMPOTENCY_COMMON_PORT, useClass: IdempotencyCommonFacade },
    IdempotencyCommonClaimUseCase,
    IdempotencyCommonCompleteUseCase,
    IdempotencyCommonPurgeExpiredUseCase,
    IdempotencyCommonReleaseUseCase,
    {
      provide: IDEMPOTENCY_COMMON_CLAIM_REPOSITORY_PORT,
      useClass: IdempotencyCommonClaimRepository,
    },
    {
      provide: IDEMPOTENCY_COMMON_COMPLETE_REPOSITORY_PORT,
      useClass: IdempotencyCommonCompleteRepository,
    },
    {
      provide: IDEMPOTENCY_COMMON_PURGE_EXPIRED_REPOSITORY_PORT,
      useClass: IdempotencyCommonPurgeExpiredRepository,
    },
    {
      provide: IDEMPOTENCY_COMMON_RELEASE_REPOSITORY_PORT,
      useClass: IdempotencyCommonReleaseRepository,
    },
    ConfigProviderHelper.value(IDEMPOTENCY_COMMON_KEY_TTL_HOURS, 'IDEMPOTENCY_KEY_TTL_HOURS'),
  ],
})
export class IdempotencyCommonModule {}
