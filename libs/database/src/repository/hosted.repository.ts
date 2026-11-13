import { Repository, type ObjectLiteral, type QueryDeepPartialEntity } from 'typeorm';

import type { IHostedRepository } from '@acme-libs/contracts/database';

export class HostedRepository<Entity extends ObjectLiteral>
  extends Repository<Entity>
  implements IHostedRepository<Entity>
{
  public async insertOne(entity: QueryDeepPartialEntity<Entity>): Promise<string> {
    const insertResult = await this.insert(entity);
    const [identifier] = insertResult.identifiers as { id: number | string }[];

    return String(identifier.id);
  }
}
