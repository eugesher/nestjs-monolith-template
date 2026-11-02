import type { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export interface IRepositoryHostPort {
  getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity>;
}

export const REPOSITORY_HOST_PORT = Symbol('REPOSITORY_HOST_PORT');
