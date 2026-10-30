import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ILedgerRecordLedgerPort, LEDGER_RECORD_LEDGER_PORT } from '../../outbound';
import { ILedgerRecordAppendCommand } from '../interfaces';

@Injectable()
export class LedgerRecordAppendUseCase {
  constructor(
    @Inject(LEDGER_RECORD_LEDGER_PORT)
    private readonly ledger: ILedgerRecordLedgerPort,
    @InjectPinoLogger(LedgerRecordAppendUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ILedgerRecordAppendCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;

    this.logger.info({ operationKey, action }, 'Ledger record received');

    const view = await this.ledger.append({
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      occurredAt,
    });
    const { appended } = view;
    const message = appended ? 'Ledger record appended' : 'Ledger record already appended';

    this.logger.info({ operationKey, appended }, message);
  }
}
