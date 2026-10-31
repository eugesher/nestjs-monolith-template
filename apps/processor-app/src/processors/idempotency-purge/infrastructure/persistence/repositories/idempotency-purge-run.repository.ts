import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { LessThan, Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { type IIdempotencyPurgeRunRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyPurgeRunRepository implements IIdempotencyPurgeRunRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.transactionHost.tx.getRepository(IdempotencyKey);
  }

  public async deleteCreatedBefore(cutoff: Date): Promise<number> {
    const result = await this.idempotencyKeyRepository.delete({ createdAt: LessThan(cutoff) });

    return result.affected ?? 0;
  }
}
