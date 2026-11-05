import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ILedgerAppendQueuePort, LEDGER_APPEND_QUEUE_PORT } from '../../outbound';

@Injectable()
export class LedgerAppendRetryFailedUseCase {
  constructor(
    @Inject(LEDGER_APPEND_QUEUE_PORT)
    private readonly queue: ILedgerAppendQueuePort,
    @InjectPinoLogger(LedgerAppendRetryFailedUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(): Promise<void> {
    try {
      const retried = await this.queue.retryFailed();

      this.logger.info({ retried }, 'Failed ledger records are back in the queue');
    } catch (error) {
      this.logger.warn({ err: error }, 'Ledger record retry failed, the next tick retries');
    }
  }
}
