import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { IRepositoryHostPort } from '@acme-libs/contracts/database';

@Injectable()
export class RepositoryHostAdapter implements IRepositoryHostPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): Repository<Entity> {
    return this.transactionHost.tx.getRepository(entity);
  }
}
