import { Module } from '@nestjs/common';

import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ConfigProviderHelper } from '@acme-libs/config';
import { IdempotencyPurgeRunUseCase } from './application';
import { IdempotencyPurgeIdempotencyCoreAdapter } from './infrastructure';
import { IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT, IDEMPOTENCY_PURGE_KEY_TTL_HOURS } from './outbound';
import { IdempotencyPurgeConsumer } from './presentation/idempotency-purge.consumer';

@Module({
  imports: [IdempotencyCoreModule],
  providers: [
    IdempotencyPurgeConsumer,
    IdempotencyPurgeRunUseCase,
    {
      provide: IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT,
      useClass: IdempotencyPurgeIdempotencyCoreAdapter,
    },
    ConfigProviderHelper.value(IDEMPOTENCY_PURGE_KEY_TTL_HOURS, 'IDEMPOTENCY_KEY_TTL_HOURS'),
  ],
})
export class IdempotencyPurgeModule {}
