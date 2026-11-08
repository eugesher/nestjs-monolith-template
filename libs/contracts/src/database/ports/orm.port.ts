import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository } from '../interfaces/hosted-repository.interface';

export interface IOrmPort {
  getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity>;
}

export const ORM_PORT = Symbol('ORM_PORT');
