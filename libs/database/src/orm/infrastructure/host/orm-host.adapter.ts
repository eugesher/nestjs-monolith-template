import { ClassProvider, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository } from '@acme-libs/contracts/database';

import { IOrmHostPort, ORM_HOST_PORT } from '../../outbound';
import { OrmHostedRepository } from '../repository/orm-hosted.repository';

@Injectable()
export class OrmHostAdapter implements IOrmHostPort {
  public static readonly provider: ClassProvider<IOrmHostPort> = {
    provide: ORM_HOST_PORT,
    useClass: OrmHostAdapter,
  };

  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity> {
    const manager = this.transactionHost.tx;

    return new OrmHostedRepository(entity, manager, manager.queryRunner);
  }
}
