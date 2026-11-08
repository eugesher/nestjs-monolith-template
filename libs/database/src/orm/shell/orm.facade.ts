import { Injectable } from '@nestjs/common';
import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { OrmGetRepositoryUseCase } from '../application';

@Injectable()
export class OrmFacade implements IOrmPort {
  constructor(private readonly getRepositoryUseCase: OrmGetRepositoryUseCase) {}

  public getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity> {
    return this.getRepositoryUseCase.execute(entity);
  }
}
