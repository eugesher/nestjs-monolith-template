import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
import { IdempotencyPurgeRunUseCase } from './application';
import { IdempotencyPurgeRunRepository, IdempotencyPurgeTypeOrmModule } from './infrastructure';
import { IDEMPOTENCY_PURGE_KEY_TTL_HOURS, IDEMPOTENCY_PURGE_RUN_REPOSITORY_PORT } from './outbound';
import { IdempotencyPurgeConsumer } from './presentation/idempotency-purge.consumer';

@Module({
  imports: [IdempotencyPurgeTypeOrmModule.forFeature()],
  providers: [
    IdempotencyPurgeConsumer,
    IdempotencyPurgeRunUseCase,
    { provide: IDEMPOTENCY_PURGE_RUN_REPOSITORY_PORT, useClass: IdempotencyPurgeRunRepository },
    ConfigProviderHelper.value(IDEMPOTENCY_PURGE_KEY_TTL_HOURS, 'IDEMPOTENCY_KEY_TTL_HOURS'),
  ],
})
export class IdempotencyPurgeModule {}
