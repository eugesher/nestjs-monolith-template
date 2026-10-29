import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  type IIdempotencyPurgeIdempotencyPort,
  IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT,
} from '../../outbound';

@Injectable()
export class IdempotencyPurgeRunUseCase {
  private running = false;

  constructor(
    @Inject(IDEMPOTENCY_PURGE_IDEMPOTENCY_PORT)
    private readonly idempotency: IIdempotencyPurgeIdempotencyPort,
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
      await this.idempotency.purgeExpired();
    } catch (error) {
      this.logger.warn({ err: error }, 'Idempotency purge failed, the next tick retries');
    } finally {
      this.running = false;
    }
  }
}
