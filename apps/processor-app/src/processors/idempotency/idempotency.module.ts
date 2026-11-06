import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';

import { IdempotencyPurgeUseCase } from './application';
import { IdempotencyPurgeRepository } from './infrastructure';
import { IDEMPOTENCY_KEY_TTL_HOURS_TOKEN, IDEMPOTENCY_PURGE_REPOSITORY_PORT } from './outbound';
import { IdempotencyPurgeProcessor } from './presentation/idempotency-purge.processor';

@Module({
  providers: [
    IdempotencyPurgeProcessor,
    IdempotencyPurgeUseCase,
    { provide: IDEMPOTENCY_PURGE_REPOSITORY_PORT, useClass: IdempotencyPurgeRepository },
    ConfigValueProvider.provide({
      provide: IDEMPOTENCY_KEY_TTL_HOURS_TOKEN,
      property: 'IDEMPOTENCY_KEY_TTL_HOURS',
    }),
  ],
})
export class IdempotencyModule {}
