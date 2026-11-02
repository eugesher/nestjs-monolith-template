import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyKey } from '@acme-core/entities';

import { type IIdempotencyCoreReleaseRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyCoreReleaseRepository implements IIdempotencyCoreReleaseRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async deleteInFlight(key: string): Promise<void> {
    await this.idempotencyKeyRepository.delete({
      idempotencyKey: key,
      status: IdempotencyStatusEnum.IN_FLIGHT,
    });
  }
}
