import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { MysqlErrorHelper } from '@acme-libs/toolkit';

import {
  ILedgerAppendEntryDraftOutput,
  LedgerAppendEntryModel,
  LedgerAppendHelper,
} from '../../domain';
import { LEDGER_APPEND_REPOSITORY_PORT, type ILedgerAppendRepositoryPort } from '../../outbound';
import { ILedgerAppendCommand, ILedgerAppendOutcomeView } from '../interfaces';

@Injectable()
export class LedgerAppendUseCase {
  constructor(
    @Inject(LEDGER_APPEND_REPOSITORY_PORT)
    private readonly repository: ILedgerAppendRepositoryPort,
    @InjectPinoLogger(LedgerAppendUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ILedgerAppendCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;

    this.logger.info({ operationKey, action }, 'Ledger record received');

    const instant = LedgerAppendHelper.parseInstant(occurredAt, 'occurredAt');
    const correlationId = CorrelationContextHelper.current(LedgerAppendUseCase.name);
    const draft = LedgerAppendEntryModel.createDraft({
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

  private async append(draft: ILedgerAppendEntryDraftOutput): Promise<ILedgerAppendOutcomeView> {
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
