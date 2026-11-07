import { Injectable } from '@nestjs/common';

import { ITransactionPort } from '@acme-libs/contracts/local-storage';

import {
  LocalStorageTransactionalAfterCommitUseCase,
  LocalStorageTransactionalRunUseCase,
} from '../application';

@Injectable()
export class LocalStorageTransactionalFacade implements ITransactionPort {
  constructor(
    private readonly runInTransaction: LocalStorageTransactionalRunUseCase,
    private readonly addAfterCommitHook: LocalStorageTransactionalAfterCommitUseCase,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.runInTransaction.execute(work);
  }

  public afterCommit(hook: () => Promise<void>): void {
    this.addAfterCommitHook.execute(hook);
  }
}
