import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LedgerRecordEntryModel, LedgerRecordHelper } from '../../domain';
import {
  type ILedgerRecordAppendRepositoryPort,
  LEDGER_RECORD_APPEND_REPOSITORY_PORT,
} from '../../outbound';
import { ILedgerRecordAppendCommand } from '../interfaces';

@Injectable()
export class LedgerRecordAppendUseCase {
  constructor(
    @Inject(LEDGER_RECORD_APPEND_REPOSITORY_PORT)
    private readonly repository: ILedgerRecordAppendRepositoryPort,
    @InjectPinoLogger(LedgerRecordAppendUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ILedgerRecordAppendCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;

    this.logger.info({ operationKey, action }, 'Ledger record received');

    const instant = LedgerRecordHelper.parseInstant(occurredAt, 'occurredAt');
    const correlationId = CorrelationContextHelper.current(LedgerRecordAppendUseCase.name);
    const entry = LedgerRecordEntryModel.create({
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt: instant,
    });
    const outcome = await this.repository.append(entry);
    const { id, appended } = outcome;
    const message = appended ? 'Ledger record appended' : 'Ledger record already appended';

    this.logger.info({ id, operationKey: entry.operationKey, appended }, message);
  }
}
