import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { type IIdempotencyCommonReleaseRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyCommonReleaseRepository implements IIdempotencyCommonReleaseRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get keys(): Repository<IdempotencyKey> {
    return this.txHost.tx.getRepository(IdempotencyKey);
  }

  public async deleteInFlight(key: string): Promise<void> {
    await this.keys.delete({ idempotencyKey: key, status: IdempotencyStatusEnum.IN_FLIGHT });
  }
}
