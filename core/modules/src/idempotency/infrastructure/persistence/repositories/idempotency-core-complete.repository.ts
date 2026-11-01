import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyKey } from '@acme-core/entities';

import {
  type IIdempotencyCoreCompleteRepositoryPort,
  IIdempotencyCoreKeyCompletionCommand,
} from '../../../outbound';

@Injectable()
export class IdempotencyCoreCompleteRepository implements IIdempotencyCoreCompleteRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

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
