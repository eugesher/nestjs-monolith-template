import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { ILedgerRecordEntryDraft, LedgerRecordEntryModel, LedgerRecordHelper } from '../../domain';
import {
  type ILedgerRecordAppendRepositoryPort,
  LEDGER_RECORD_APPEND_REPOSITORY_PORT,
} from '../../outbound';
import { ILedgerRecordAppendCommand, ILedgerRecordAppendOutcomeView } from '../interfaces';

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
    const draft = LedgerRecordEntryModel.createDraft({
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt: instant,
    });
    const outcome = await this.append(draft);
    const { id, appended } = outcome;
    const message = appended ? 'Ledger record appended' : 'Ledger record already appended';

    this.logger.info({ id, operationKey: draft.operationKey, appended }, message);
  }

  private async append(draft: ILedgerRecordEntryDraft): Promise<ILedgerRecordAppendOutcomeView> {
    try {
      const id = await this.repository.insert(draft);

      return { id, appended: true };
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      const existing = await this.repository.findByOperationKey(draft.operationKey);

      return { id: existing.id, appended: false };
    }
  }
}
