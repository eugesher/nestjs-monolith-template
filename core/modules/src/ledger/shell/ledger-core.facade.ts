import { Injectable } from '@nestjs/common';

import type { ILedgerCoreEnqueueCommand, ILedgerCorePort } from '@acme-core/contracts/ledger';

import { LedgerCoreEnqueueUseCase } from '../application';

@Injectable()
export class LedgerCoreFacade implements ILedgerCorePort {
  constructor(private readonly enqueue: LedgerCoreEnqueueUseCase) {}

  public async handleEnqueue(command: ILedgerCoreEnqueueCommand): Promise<void> {
    await this.enqueue.execute(command);
  }
}
