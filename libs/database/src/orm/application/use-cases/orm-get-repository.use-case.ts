import { Inject, Injectable } from '@nestjs/common';
import type { EntityTarget, ObjectLiteral } from 'typeorm';

import type { IHostedRepository } from '@acme-libs/contracts/database';

import { HostedRepository } from '../../../repository/hosted.repository';
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
    const repository = this.host.getRepository(entity);

    return new HostedRepository(repository.target, repository.manager, repository.queryRunner);
  }
}
