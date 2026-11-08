import { Inject, Injectable } from '@nestjs/common';
import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository } from '@acme-libs/contracts/database';

import { ORM_HOST_PORT, type IOrmHostPort } from '../../outbound';

@Injectable()
export class OrmGetRepositoryUseCase {
  constructor(
    @Inject(ORM_HOST_PORT)
    private readonly host: IOrmHostPort,
  ) {}

  public execute<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity> {
    return this.host.getRepository(entity);
  }
}
