import { Inject, Injectable } from '@nestjs/common';

import {
  LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT,
  LOCAL_STORAGE_TRANSACTION_HOST_PORT,
  type ILocalStorageTransactionContextPort,
  type ILocalStorageTransactionHostPort,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionAfterCommitUseCase {
  constructor(
    @Inject(LOCAL_STORAGE_TRANSACTION_HOST_PORT)
    private readonly host: ILocalStorageTransactionHostPort,
    @Inject(LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT)
    private readonly context: ILocalStorageTransactionContextPort,
  ) {}

  public execute(hook: () => Promise<void>): void {
    const hooks = this.context.getHooks();

    if (!this.host.isActive() || !hooks) {
      throw new Error('afterCommit must be called inside LOCAL_STORAGE_TRANSACTION.run');
    }

    hooks.push(hook);
  }
}
