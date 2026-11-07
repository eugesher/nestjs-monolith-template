import { ClassProvider, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import {
  ILocalStorageTransactionHostPort,
  LOCAL_STORAGE_TRANSACTION_HOST_PORT,
} from '../../outbound';

@Injectable()
export class LocalStorageTransactionHostAdapter implements ILocalStorageTransactionHostPort {
  public static readonly provider: ClassProvider<ILocalStorageTransactionHostPort> = {
    provide: LOCAL_STORAGE_TRANSACTION_HOST_PORT,
    useClass: LocalStorageTransactionHostAdapter,
  };

  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public isActive(): boolean {
    return this.transactionHost.isTransactionActive();
  }

  public async withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return await this.transactionHost.withTransaction(work);
  }
}
