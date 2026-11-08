import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export interface IOrmHostPort {
  getRepository<Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity>;
}

export const ORM_HOST_PORT = Symbol('ORM_HOST_PORT');
