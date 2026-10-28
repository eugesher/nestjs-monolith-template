import { Inject, Injectable } from '@nestjs/common';

import { type ILedgerCoreAppendPort, LEDGER_CORE_APPEND_PORT } from '@acme-core/contracts/ledger';
import { IItemLedgerAppendCommand, IItemLedgerPort } from '../../outbound';

@Injectable()
export class ItemLedgerCoreAdapter implements IItemLedgerPort {
  constructor(
    @Inject(LEDGER_CORE_APPEND_PORT)
    private readonly ledger: ILedgerCoreAppendPort,
  ) {}

  public async append(command: IItemLedgerAppendCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;

    await this.ledger.append({ operationKey, subjectType, subjectId, action, payload, occurredAt });
  }
}
