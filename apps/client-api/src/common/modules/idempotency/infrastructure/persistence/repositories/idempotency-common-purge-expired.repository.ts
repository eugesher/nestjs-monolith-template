import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { LessThan, Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { type IIdempotencyCommonPurgeExpiredRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyCommonPurgeExpiredRepository implements IIdempotencyCommonPurgeExpiredRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get keys(): Repository<IdempotencyKey> {
    return this.txHost.tx.getRepository(IdempotencyKey);
  }

  public async deleteCreatedBefore(cutoff: Date): Promise<number> {
    const result = await this.keys.delete({ createdAt: LessThan(cutoff) });

    return result.affected ?? 0;
  }
}
