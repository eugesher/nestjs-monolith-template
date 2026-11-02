import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyKey } from '@acme-core/entities';

import { IIdempotencyCoreReleaseRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyCoreReleaseRepository implements IIdempotencyCoreReleaseRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async deleteInFlight(key: string): Promise<void> {
    await this.idempotencyKeyRepository.delete({
      idempotencyKey: key,
      status: IdempotencyStatusEnum.IN_FLIGHT,
    });
  }
}
