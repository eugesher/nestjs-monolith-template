import { Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { IdempotencyKey } from '@acme-core/entities';

import { type IIdempotencyPurgeRunRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyPurgeRunRepository implements IIdempotencyPurgeRunRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async deleteCreatedBefore(cutoff: Date): Promise<number> {
    const result = await this.idempotencyKeyRepository.delete({ createdAt: LessThan(cutoff) });

    return result.affected ?? 0;
  }
}
