import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CorrelationContextHelper } from '@acme-libs/observability';

import { IdempotencyPurgeUseCase } from '../../application';

@Injectable()
export class IdempotencyPurgeProcessor {
  constructor(private readonly purge: IdempotencyPurgeUseCase) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'idempotency-purge' })
  public async handleTick(): Promise<void> {
    await CorrelationContextHelper.run(undefined, () => this.purge.execute());
  }
}
