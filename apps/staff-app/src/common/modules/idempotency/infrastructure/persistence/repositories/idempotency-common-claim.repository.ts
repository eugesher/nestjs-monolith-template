import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { IdempotencyKey } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { Maybe } from '@acme-libs/toolkit';
import { IdempotencyCommonKeyModel } from '../../../domain';
import { type IIdempotencyCommonClaimRepositoryPort } from '../../../outbound';
import { IdempotencyCommonKeyMapper } from '../mappers/idempotency-common-key.mapper';

@Injectable()
export class IdempotencyCommonClaimRepository implements IIdempotencyCommonClaimRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get keys(): Repository<IdempotencyKey> {
    return this.txHost.tx.getRepository(IdempotencyKey);
  }

  public async insert(key: IdempotencyCommonKeyModel): Promise<boolean> {
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

  public async findByKey(key: string): Promise<Maybe<IdempotencyCommonKeyModel>> {
    const entity = await this.keys.findOne({ where: { idempotencyKey: key } });

    return entity === null ? undefined : IdempotencyCommonKeyMapper.toModel(entity);
  }
}
