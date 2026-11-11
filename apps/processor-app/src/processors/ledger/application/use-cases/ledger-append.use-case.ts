import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';

import {
  LedgerAppendEntryModel,
  LedgerAppendHelper,
  type ILedgerAppendEntryDraftOutput,
} from '../../domain';
import {
  LEDGER_APPEND_REPOSITORY_PORT,
  LedgerAppendEntryInsertOutcomeEnum,
  type ILedgerAppendRepositoryPort,
} from '../../outbound';
import type { ILedgerAppendCommand, ILedgerAppendOutcomeView } from '../interfaces';

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
    const inserted = await this.repository.insert(draft);

    if (inserted.outcome === LedgerAppendEntryInsertOutcomeEnum.INSERTED) {
      return { id: inserted.id, appended: true };
    }

    const existing = await this.repository.findByOperationKey(draft.operationKey);

    return { id: existing.id, appended: false };
  }
}
