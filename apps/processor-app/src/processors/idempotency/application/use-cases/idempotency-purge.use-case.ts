import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { IdempotencyPurgeHelper } from '../../domain';
import {
  IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN,
  IDEMPOTENCY_KEY_TTL_HOURS_TOKEN,
  IDEMPOTENCY_PURGE_REPOSITORY_PORT,
  type IIdempotencyPurgeRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdempotencyPurgeUseCase {
  private running = false;

  constructor(
    @Inject(IDEMPOTENCY_PURGE_REPOSITORY_PORT)
    private readonly repository: IIdempotencyPurgeRepositoryPort,
    @Inject(IDEMPOTENCY_KEY_TTL_HOURS_TOKEN)
    private readonly ttlHours: number,
    @Inject(IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN)
    private readonly inFlightTtlMinutes: number,
    @InjectPinoLogger(IdempotencyPurgeUseCase.name)
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
    const inFlightCutoff = IdempotencyPurgeHelper.inFlightCutoff(now, this.inFlightTtlMinutes);
    const deleted = await this.repository.deleteCreatedBefore(cutoff);
    const deletedInFlight = await this.repository.deleteInFlightCreatedBefore(inFlightCutoff);
    const removed = deleted.affected ?? 0;
    const removedInFlight = deletedInFlight.affected ?? 0;

    this.logger.info(
      {
        cutoff: cutoff.toISOString(),
        removed,
        ttlHours: this.ttlHours,
        inFlightCutoff: inFlightCutoff.toISOString(),
        removedInFlight,
        inFlightTtlMinutes: this.inFlightTtlMinutes,
      },
      'Expired idempotency keys purged',
    );
  }
}
