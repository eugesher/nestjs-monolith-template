import { Injectable } from '@nestjs/common';

import type { ILedgerLibEnqueueCommand, ILedgerLibPort } from '@acme-libs/contracts/ledger';

import { LedgerLibEnqueueUseCase } from '../application';

@Injectable()
export class LedgerLibFacade implements ILedgerLibPort {
  constructor(private readonly enqueue: LedgerLibEnqueueUseCase) {}

  public async handleEnqueue(command: ILedgerLibEnqueueCommand): Promise<void> {
    await this.enqueue.execute(command);
  }
}
