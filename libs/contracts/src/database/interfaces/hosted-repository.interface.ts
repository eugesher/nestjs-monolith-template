import type { ObjectLiteral, QueryDeepPartialEntity, Repository } from 'typeorm';

export interface IHostedRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  insertOne(entity: QueryDeepPartialEntity<Entity>): Promise<string>;
}
