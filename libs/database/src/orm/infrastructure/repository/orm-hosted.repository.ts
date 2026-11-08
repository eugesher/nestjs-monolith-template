import { ObjectLiteral, QueryDeepPartialEntity, Repository } from 'typeorm';

import { IHostedRepository } from '@acme-libs/contracts/database';

export class OrmHostedRepository<Entity extends ObjectLiteral>
  extends Repository<Entity>
  implements IHostedRepository<Entity>
{
  public async insertOne(entity: QueryDeepPartialEntity<Entity>): Promise<string> {
    const result = await this.insert(entity);
    const [identifier] = result.identifiers as { id: number | string }[];

    return String(identifier.id);
  }
}
