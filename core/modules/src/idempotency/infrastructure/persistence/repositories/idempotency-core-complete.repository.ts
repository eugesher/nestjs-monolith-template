import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyKey } from '@acme-core/entities';

import {
  IIdempotencyCoreCompleteRepositoryPort,
  IIdempotencyCoreCompleteQuery,
} from '../../../outbound';

@Injectable()
export class IdempotencyCoreCompleteRepository implements IIdempotencyCoreCompleteRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async complete(query: IIdempotencyCoreCompleteQuery): Promise<void> {
    const { key, responseBody } = query;

    await this.idempotencyKeyRepository.update(
      { idempotencyKey: key },
      { status: IdempotencyStatusEnum.COMPLETED, responseBody },
    );
  }
}
