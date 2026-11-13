import { Inject, Injectable } from '@nestjs/common';

import {
  LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT,
  LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT,
  type ILocalStorageTransactionalContextPort,
  type ILocalStorageTransactionalHostPort,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionalAfterCommitUseCase {
  constructor(
    @Inject(LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT)
    private readonly host: ILocalStorageTransactionalHostPort,
    @Inject(LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT)
    private readonly context: ILocalStorageTransactionalContextPort,
  ) {}

  public execute(hook: () => Promise<void>): void {
    const hooks = this.context.getHooks();

    if (!this.host.isActive() || !hooks) {
      throw new Error('afterCommit must be called inside TRANSACTION_PORT.run');
    }

    hooks.push(hook);
  }
}
