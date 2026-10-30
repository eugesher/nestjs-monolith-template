import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ILedgerRecordQueuePort, LEDGER_RECORD_QUEUE_PORT } from '../../outbound';

@Injectable()
export class LedgerRecordRetryFailedUseCase {
  constructor(
    @Inject(LEDGER_RECORD_QUEUE_PORT)
    private readonly queue: ILedgerRecordQueuePort,
    @InjectPinoLogger(LedgerRecordRetryFailedUseCase.name)
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
