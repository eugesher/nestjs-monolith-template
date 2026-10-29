import { Inject, Injectable } from '@nestjs/common';

import { type ILedgerCoreAppendPort, LEDGER_CORE_APPEND_PORT } from '@acme-core/contracts/ledger';
import {
  ILedgerRecordLedgerAppendCommand,
  ILedgerRecordLedgerAppendView,
  ILedgerRecordLedgerPort,
} from '../../outbound';

@Injectable()
export class LedgerRecordLedgerCoreAdapter implements ILedgerRecordLedgerPort {
  constructor(
    @Inject(LEDGER_CORE_APPEND_PORT)
    private readonly ledger: ILedgerCoreAppendPort,
  ) {}

  public async append(
    command: ILedgerRecordLedgerAppendCommand,
  ): Promise<ILedgerRecordLedgerAppendView> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;
    const view = await this.ledger.append({
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      occurredAt,
    });
    const { appended } = view;

    return { appended };
  }
}
