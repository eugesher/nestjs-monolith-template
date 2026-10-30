import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { Maybe, Nullable } from '@acme-libs/toolkit';
import { IIdempotencyCoreKeyDraft } from '../interfaces/idempotency-core-key-draft.interface';
import { IIdempotencyCoreKeyRecord } from '../interfaces/idempotency-core-key-record.interface';

export class IdempotencyCoreKeyModel {
  private static readonly MAX_KEY_LENGTH = 128;

  private constructor(
    public readonly id: Maybe<string>,
    public readonly key: string,
    public readonly requestFingerprint: string,
    public readonly status: IdempotencyStatusEnum,
    public readonly responseBody: Nullable<string>,
    public readonly createdAt: Maybe<Date>,
  ) {
    Object.freeze(this);
  }

  public static claim(draft: IIdempotencyCoreKeyDraft): IdempotencyCoreKeyModel {
    const { key, requestFingerprint } = draft;

    if (key.length === 0) {
      throw new Error('IdempotencyKey.key is required');
    }

    if (key.length > IdempotencyCoreKeyModel.MAX_KEY_LENGTH) {
      throw new Error('IdempotencyKey.key must be at most 128 characters');
    }

    return new IdempotencyCoreKeyModel(
      undefined,
      key,
      requestFingerprint,
      IdempotencyStatusEnum.IN_FLIGHT,
      null,
      undefined,
    );
  }

  public static reconstitute(record: IIdempotencyCoreKeyRecord): IdempotencyCoreKeyModel {
    const { id, key, requestFingerprint, status, responseBody, createdAt } = record;

    return new IdempotencyCoreKeyModel(
      id,
      key,
      requestFingerprint,
      status,
      responseBody,
      createdAt,
    );
  }

  public matches(requestFingerprint: string): boolean {
    return this.requestFingerprint === requestFingerprint;
  }

  public isCompleted(): this is IdempotencyCoreKeyModel & { responseBody: string } {
    return this.status === IdempotencyStatusEnum.COMPLETED && this.responseBody !== null;
  }
}
