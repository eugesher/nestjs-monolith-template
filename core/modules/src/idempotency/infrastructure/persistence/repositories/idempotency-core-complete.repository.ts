import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyKey } from '@acme-core/entities';

import {
  IIdempotencyCoreCompleteRepositoryPort,
  IIdempotencyCoreKeyCompletionCommand,
} from '../../../outbound';

@Injectable()
export class IdempotencyCoreCompleteRepository implements IIdempotencyCoreCompleteRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async complete(command: IIdempotencyCoreKeyCompletionCommand): Promise<void> {
    const { key, responseBody } = command;

    await this.idempotencyKeyRepository.update(
      { idempotencyKey: key },
      { status: IdempotencyStatusEnum.COMPLETED, responseBody },
    );
  }
}
