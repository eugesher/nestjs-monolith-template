import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyCoreKeyModel } from '../../../domain';

export class IdempotencyCoreKeyMapper {
  public static toModel(entity: IdempotencyKey): IdempotencyCoreKeyModel {
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
