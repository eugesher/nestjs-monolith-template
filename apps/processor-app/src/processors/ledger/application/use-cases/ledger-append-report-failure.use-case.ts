import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { ILedgerAppendReportFailureCommand } from '../interfaces';

@Injectable()
export class LedgerAppendReportFailureUseCase {
  constructor(
    @InjectPinoLogger(LedgerAppendReportFailureUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public execute(command: ILedgerAppendReportFailureCommand): void {
    const { operationKey, attempt, attempts, error } = command;

    if (attempt < attempts) {
      this.logger.warn(
        { err: error, operationKey, attempt, attempts },
        'Ledger record failed, Bull retries the job',
      );

      return;
    }

    this.logger.error(
      { err: error, operationKey, attempt, attempts },
      'Ledger record failed permanently: the job stays in the failed set of the queue, replay it',
    );
  }
}
