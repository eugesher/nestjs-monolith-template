import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { IdempotencyPurgeRunUseCase } from '../application';

@Injectable()
export class IdempotencyPurgeConsumer {
  constructor(private readonly run: IdempotencyPurgeRunUseCase) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'idempotency-purge' })
  public handleTick(): Promise<void> {
    return CorrelationContextHelper.run(undefined, () => this.run.execute());
  }
}
