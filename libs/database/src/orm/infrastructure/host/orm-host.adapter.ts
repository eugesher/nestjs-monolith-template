import { ClassProvider, Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { IOrmHostPort, ORM_HOST_PORT } from '../../outbound';

@Injectable()
export class OrmHostAdapter implements IOrmHostPort {
  public static readonly provider: ClassProvider<IOrmHostPort> = {
    provide: ORM_HOST_PORT,
    useClass: OrmHostAdapter,
  };

  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  public getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): Repository<Entity> {
    return this.transactionHost.tx.getRepository(entity);
  }
}
