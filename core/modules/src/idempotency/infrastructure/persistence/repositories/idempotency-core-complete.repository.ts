import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import {
  type IIdempotencyCoreCompleteRepositoryPort,
  IIdempotencyCoreKeyCompletionCommand,
} from '../../../outbound';

@Injectable()
export class IdempotencyCoreCompleteRepository implements IIdempotencyCoreCompleteRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.transactionHost.tx.getRepository(IdempotencyKey);
  }

  public async complete(command: IIdempotencyCoreKeyCompletionCommand): Promise<void> {
    const { key, responseBody } = command;

    await this.idempotencyKeyRepository.update(
      { idempotencyKey: key },
      { status: IdempotencyStatusEnum.COMPLETED, responseBody },
    );
  }
}
