import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { ITransactionPort } from '@acme-libs/contracts/database';

@Injectable()
export class TransactionAdapter implements ITransactionPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public run<T>(work: () => Promise<T>): Promise<T> {
    return this.txHost.withTransaction(work);
  }
}
