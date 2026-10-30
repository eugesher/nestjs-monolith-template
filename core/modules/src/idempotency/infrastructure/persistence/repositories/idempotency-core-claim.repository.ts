import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { Maybe } from '@acme-libs/toolkit';
import { IdempotencyCoreKeyModel } from '../../../domain';
import { type IIdempotencyCoreClaimRepositoryPort } from '../../../outbound';
import { IdempotencyCoreKeyMapper } from '../mappers/idempotency-core-key.mapper';

@Injectable()
export class IdempotencyCoreClaimRepository implements IIdempotencyCoreClaimRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get keys(): Repository<IdempotencyKey> {
    return this.txHost.tx.getRepository(IdempotencyKey);
  }

  public async insert(key: IdempotencyCoreKeyModel): Promise<boolean> {
    try {
      await this.keys.insert({
        idempotencyKey: key.key,
        requestFingerprint: key.requestFingerprint,
        status: key.status,
        responseBody: key.responseBody,
      });

      return true;
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      return false;
    }
  }

  public async findByKey(key: string): Promise<Maybe<IdempotencyCoreKeyModel>> {
    const entity = await this.keys.findOne({ where: { idempotencyKey: key } });

    return entity === null ? undefined : IdempotencyCoreKeyMapper.toModel(entity);
  }
}
