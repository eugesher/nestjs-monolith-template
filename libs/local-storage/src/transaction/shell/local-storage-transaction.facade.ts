import { Injectable } from '@nestjs/common';

import { ILocalStorageTransaction } from '@acme-libs/contracts/local-storage';

import {
  LocalStorageTransactionAfterCommitUseCase,
  LocalStorageTransactionRunUseCase,
} from '../application';

@Injectable()
export class LocalStorageTransactionFacade implements ILocalStorageTransaction {
  constructor(
    private readonly runInTransaction: LocalStorageTransactionRunUseCase,
    private readonly addAfterCommitHook: LocalStorageTransactionAfterCommitUseCase,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.runInTransaction.execute(work);
  }

  public afterCommit(hook: () => Promise<void>): void {
    this.addAfterCommitHook.execute(hook);
  }
}
