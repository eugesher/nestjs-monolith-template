import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyCommonKeyModel } from '../../../domain';

export class IdempotencyCommonKeyMapper {
  public static toModel(entity: IdempotencyKey): IdempotencyCommonKeyModel {
    return IdempotencyCommonKeyModel.reconstitute({
      id: entity.id,
      key: entity.idempotencyKey,
      requestFingerprint: entity.requestFingerprint,
      status: entity.status,
      responseBody: entity.responseBody,
      createdAt: entity.createdAt,
    });
  }
}
