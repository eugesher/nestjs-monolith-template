import { Inject, Injectable } from '@nestjs/common';
import { LessThan } from 'typeorm';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { IdempotencyKey } from '@acme-core/entities';

import { IIdempotencyPurgeRunRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyPurgeRunRepository implements IIdempotencyPurgeRunRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async deleteCreatedBefore(cutoff: Date): Promise<number> {
    const result = await this.idempotencyKeyRepository.delete({ createdAt: LessThan(cutoff) });

    return result.affected ?? 0;
  }
}
