import { Injectable, type ClassProvider } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import {
  LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT,
  type ILocalStorageTransactionalHostPort,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionalHostAdapter implements ILocalStorageTransactionalHostPort {
  public static readonly provider: ClassProvider<ILocalStorageTransactionalHostPort> = {
    provide: LOCAL_STORAGE_TRANSACTIONAL_HOST_PORT,
    useClass: LocalStorageTransactionalHostAdapter,
  };

  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public isActive(): boolean {
    return this.transactionHost.isTransactionActive();
  }

  public async withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return await this.transactionHost.withTransaction(work);
  }
}
