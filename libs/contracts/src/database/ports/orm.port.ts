import type { EntityTarget, ObjectLiteral } from 'typeorm';

import type { IHostedRepository } from '../interfaces/hosted-repository.interface';

export interface IOrmPort {
  getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity>;
}

export const ORM_PORT = Symbol('ORM_PORT');
