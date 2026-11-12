import { Module } from '@nestjs/common';

import { IdempotencyPurgeUseCase } from './application';
import {
  IdempotencyConfigInFlightTtlMinutesProvider,
  IdempotencyConfigKeyTtlHoursProvider,
  IdempotencyPurgeRepository,
} from './infrastructure';
import { IdempotencyPurgeProcessor } from './presentation';

@Module({
  providers: [
    IdempotencyPurgeProcessor,
    IdempotencyPurgeUseCase,
    IdempotencyPurgeRepository.provider,
    IdempotencyConfigKeyTtlHoursProvider,
    IdempotencyConfigInFlightTtlMinutesProvider,
  ],
})
export class IdempotencyModule {}
