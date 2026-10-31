import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { type IIdempotencyCoreReleaseRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyCoreReleaseRepository implements IIdempotencyCoreReleaseRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.transactionHost.tx.getRepository(IdempotencyKey);
  }

  public async deleteInFlight(key: string): Promise<void> {
    await this.idempotencyKeyRepository.delete({
      idempotencyKey: key,
      status: IdempotencyStatusEnum.IN_FLIGHT,
    });
  }
}
