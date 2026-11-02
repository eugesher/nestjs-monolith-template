import { EntityTarget, ObjectLiteral } from 'typeorm';

import { IHostedRepository } from '../interfaces/hosted-repository.interface';

export interface IRepositoryHostPort {
  getRepository<Entity extends ObjectLiteral>(
    entity: EntityTarget<Entity>,
  ): IHostedRepository<Entity>;
}

export const REPOSITORY_HOST_PORT = Symbol('REPOSITORY_HOST_PORT');
