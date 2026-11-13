import { Injectable, type ClassProvider } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import type { Maybe } from '@acme-libs/toolkit';

import {
  LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT,
  type ILocalStorageTransactionalContextPort,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionalContextAdapter implements ILocalStorageTransactionalContextPort {
  public static readonly provider: ClassProvider<ILocalStorageTransactionalContextPort> = {
    provide: LOCAL_STORAGE_TRANSACTIONAL_CONTEXT_PORT,
    useClass: LocalStorageTransactionalContextAdapter,
  };

  private static readonly AFTER_COMMIT_HOOKS = Symbol(
    'LOCAL_STORAGE_TRANSACTIONAL_AFTER_COMMIT_HOOKS',
  );

  constructor(private readonly cls: ClsService) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.cls.run({ ifNested: 'inherit' }, work);
  }

  public setHooks(hooks: (() => Promise<void>)[]): void {
    this.cls.set(LocalStorageTransactionalContextAdapter.AFTER_COMMIT_HOOKS, hooks);
  }

  public getHooks(): Maybe<(() => Promise<void>)[]> {
    if (!this.cls.isActive()) {
      return undefined;
    }

    return this.cls.get<Maybe<(() => Promise<void>)[]>>(
      LocalStorageTransactionalContextAdapter.AFTER_COMMIT_HOOKS,
    );
  }
}
