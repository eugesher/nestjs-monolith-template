import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { MysqlErrorHelper, Nullable } from '@acme-libs/toolkit';
import { IdempotencyKey } from '@acme-core/entities';

import { IIdempotencyCoreKeyDraft, IdempotencyCoreKeyModel } from '../../../domain';
import { IIdempotencyCoreClaimRepositoryPort } from '../../../outbound';

@Injectable()
export class IdempotencyCoreClaimRepository implements IIdempotencyCoreClaimRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async insert(draft: IIdempotencyCoreKeyDraft): Promise<boolean> {
    const { key, requestFingerprint, status, responseBody } = draft;

    try {
      await this.idempotencyKeyRepository.insert({
        idempotencyKey: key,
        requestFingerprint,
        status,
        responseBody,
      });

      return true;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return false;
      }

      throw error;
    }
  }

  public async findByKey(key: string): Promise<Nullable<IdempotencyCoreKeyModel>> {
    const entity = await this.idempotencyKeyRepository
      .createQueryBuilder('IdempotencyKey')
      .select([
        'IdempotencyKey.id',
        'IdempotencyKey.idempotencyKey',
        'IdempotencyKey.requestFingerprint',
        'IdempotencyKey.status',
        'IdempotencyKey.responseBody',
        'IdempotencyKey.createdAt',
      ])
      .where('IdempotencyKey.idempotencyKey = :key', { key })
      .getOne();

    if (!entity) {
      return null;
    }

    return IdempotencyCoreKeyModel.reconstitute({
      id: entity.id,
      key: entity.idempotencyKey,
      requestFingerprint: entity.requestFingerprint,
      status: entity.status,
      responseBody: entity.responseBody,
      createdAt: entity.createdAt,
    });
  }
}
