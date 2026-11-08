import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository } from '@acme-libs/contracts/database';

export interface IOrmHostPort {
  getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity>;
}

export const ORM_HOST_PORT = Symbol('ORM_HOST_PORT');
