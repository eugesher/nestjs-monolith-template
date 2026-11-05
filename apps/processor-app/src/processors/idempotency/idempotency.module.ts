import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';

import { IdempotencyPurgeUseCase } from './application';
import { IdempotencyPurgeRepository } from './infrastructure';
import { IDEMPOTENCY_PURGE_KEY_TTL_HOURS, IDEMPOTENCY_PURGE_REPOSITORY_PORT } from './outbound';
import { IdempotencyPurgeProcessor } from './presentation/idempotency-purge.processor';

@Module({
  providers: [
    IdempotencyPurgeProcessor,
    IdempotencyPurgeUseCase,
    { provide: IDEMPOTENCY_PURGE_REPOSITORY_PORT, useClass: IdempotencyPurgeRepository },
    ConfigProviderHelper.value(IDEMPOTENCY_PURGE_KEY_TTL_HOURS, 'IDEMPOTENCY_KEY_TTL_HOURS'),
  ],
})
export class IdempotencyModule {}
