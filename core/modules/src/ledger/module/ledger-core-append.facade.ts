import { Injectable } from '@nestjs/common';

import {
  ILedgerCoreAppendEntryCommand,
  ILedgerCoreAppendEntryView,
  ILedgerCoreAppendPort,
} from '@acme-core/contracts/ledger';
import { LedgerCoreAppendEntryUseCase } from '../application';

@Injectable()
export class LedgerCoreAppendFacade implements ILedgerCoreAppendPort {
  constructor(private readonly ledgerCoreAppendEntry: LedgerCoreAppendEntryUseCase) {}

  public append(command: ILedgerCoreAppendEntryCommand): Promise<ILedgerCoreAppendEntryView> {
    return this.ledgerCoreAppendEntry.execute(command);
  }
}
