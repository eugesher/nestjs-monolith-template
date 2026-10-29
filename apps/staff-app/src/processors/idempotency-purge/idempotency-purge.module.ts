import { Module } from '@nestjs/common';

import { IdempotencyCommonModule } from '@acme-staff-common/modules/idempotency';
import { IdempotencyPurgeRunUseCase } from './application';
import { IdempotencyPurgeIdempotencyCommonAdapter } from './infrastructure';
import { IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT } from './outbound';
import { IdempotencyPurgeConsumer } from './presentation/idempotency-purge.consumer';

@Module({
  imports: [IdempotencyCommonModule],
  providers: [
    IdempotencyPurgeConsumer,
    IdempotencyPurgeRunUseCase,
    {
      provide: IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT,
      useClass: IdempotencyPurgeIdempotencyCommonAdapter,
    },
  ],
})
export class IdempotencyPurgeModule {}
