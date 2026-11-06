import { Module } from '@nestjs/common';

import { IdempotencyPurgeUseCase } from './application';
import { IdempotencyConfigKeyTtlHoursProvider, IdempotencyPurgeRepository } from './infrastructure';
import { IdempotencyPurgeProcessor } from './presentation/idempotency-purge.processor';

@Module({
  providers: [
    IdempotencyPurgeProcessor,
    IdempotencyPurgeUseCase,
    IdempotencyPurgeRepository.provider,
    IdempotencyConfigKeyTtlHoursProvider,
  ],
})
export class IdempotencyModule {}
