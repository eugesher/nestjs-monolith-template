import { ClassProvider, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { Maybe } from '@acme-libs/toolkit';

import {
  ILocalStorageTransactionContextPort,
  LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionContextAdapter implements ILocalStorageTransactionContextPort {
  public static readonly provider: ClassProvider<ILocalStorageTransactionContextPort> = {
    provide: LOCAL_STORAGE_TRANSACTION_CONTEXT_PORT,
    useClass: LocalStorageTransactionContextAdapter,
  };

  private static readonly AFTER_COMMIT_HOOKS = Symbol(
    'LOCAL_STORAGE_TRANSACTION_AFTER_COMMIT_HOOKS',
  );

  constructor(private readonly cls: ClsService) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.cls.run({ ifNested: 'inherit' }, work);
  }

  public setHooks(hooks: (() => Promise<void>)[]): void {
    this.cls.set(LocalStorageTransactionContextAdapter.AFTER_COMMIT_HOOKS, hooks);
  }

  public getHooks(): Maybe<(() => Promise<void>)[]> {
    if (!this.cls.isActive()) {
      return undefined;
    }

    return this.cls.get<Maybe<(() => Promise<void>)[]>>(
      LocalStorageTransactionContextAdapter.AFTER_COMMIT_HOOKS,
    );
  }
}
