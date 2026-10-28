import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  ILedgerCoreAppendEntryCommand,
  ILedgerCoreAppendEntryView,
} from '@acme-core/contracts/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { LedgerCoreEntryModel, LedgerCoreHelper } from '../../domain';
import {
  type ILedgerCoreAppendEntryRepositoryPort,
  LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT,
} from '../../outbound';

@Injectable()
export class LedgerCoreAppendEntryUseCase {
  constructor(
    @Inject(LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT)
    private readonly repository: ILedgerCoreAppendEntryRepositoryPort,
    @InjectPinoLogger(LedgerCoreAppendEntryUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: ILedgerCoreAppendEntryCommand,
  ): Promise<ILedgerCoreAppendEntryView> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;
    const instant = LedgerCoreHelper.parseInstant(occurredAt, 'occurredAt');
    const correlationId = CorrelationContextHelper.current(LedgerCoreAppendEntryUseCase.name);
    const entry = LedgerCoreEntryModel.create({
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt: instant,
    });
    const { id, appended } = await this.repository.append(entry);

    if (appended) {
      this.logger.info({ id, operationKey: entry.operationKey }, 'Ledger entry appended');
    } else {
      this.logger.info(
        { id, operationKey: entry.operationKey },
        'Ledger entry already recorded under this operation key',
      );
    }

    return { id, appended };
  }
}
