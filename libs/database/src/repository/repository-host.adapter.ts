import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';

import { HostedRepository } from './hosted.repository';

@Injectable()
export class RepositoryHostAdapter implements IRepositoryHostPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity> {
    const manager = this.transactionHost.tx;

    return new HostedRepository(entity, manager, manager.queryRunner);
  }
}
