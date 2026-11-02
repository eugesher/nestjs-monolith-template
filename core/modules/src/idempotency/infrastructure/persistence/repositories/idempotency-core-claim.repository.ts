import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { MysqlErrorHelper } from '@acme-libs/database';
import { Nullable } from '@acme-libs/toolkit';
import { IdempotencyKey } from '@acme-core/entities';

import { IdempotencyCoreKeyModel } from '../../../domain';
import { type IIdempotencyCoreClaimRepositoryPort } from '../../../outbound';
import { IdempotencyCoreKeyMapper } from '../mappers/idempotency-core-key.mapper';

@Injectable()
export class IdempotencyCoreClaimRepository implements IIdempotencyCoreClaimRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): Repository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async insert(key: IdempotencyCoreKeyModel): Promise<boolean> {
    try {
      await this.idempotencyKeyRepository.insert({
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

  public async findByKey(key: string): Promise<Nullable<IdempotencyCoreKeyModel>> {
    const entity = await this.idempotencyKeyRepository.findOne({ where: { idempotencyKey: key } });

    return entity === null ? null : IdempotencyCoreKeyMapper.toModel(entity);
  }
}
