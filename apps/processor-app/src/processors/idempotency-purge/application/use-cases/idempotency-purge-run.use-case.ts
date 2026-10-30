import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IdempotencyPurgeHelper } from '../../domain';
import {
  type IIdempotencyPurgeRunRepositoryPort,
  IDEMPOTENCY_PURGE_KEY_TTL_HOURS,
  IDEMPOTENCY_PURGE_RUN_REPOSITORY_PORT,
} from '../../outbound';

@Injectable()
export class IdempotencyPurgeRunUseCase {
  private running = false;

  constructor(
    @Inject(IDEMPOTENCY_PURGE_RUN_REPOSITORY_PORT)
    private readonly repository: IIdempotencyPurgeRunRepositoryPort,
    @Inject(IDEMPOTENCY_PURGE_KEY_TTL_HOURS)
    private readonly ttlHours: number,
    @InjectPinoLogger(IdempotencyPurgeRunUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(): Promise<void> {
    if (this.running) {
      this.logger.info({}, 'Idempotency purge still running, this tick is skipped');

      return;
    }

    this.running = true;

    try {
      await this.purge();
    } catch (error) {
      this.logger.warn({ err: error }, 'Idempotency purge failed, the next tick retries');
    } finally {
      this.running = false;
    }
  }

  private async purge(): Promise<void> {
    const now = new Date();
    const cutoff = IdempotencyPurgeHelper.expiryCutoff(now, this.ttlHours);
    const removed = await this.repository.deleteCreatedBefore(cutoff);

    this.logger.info(
      { cutoff: cutoff.toISOString(), removed, ttlHours: this.ttlHours },
      'Expired idempotency keys purged',
    );
  }
}
