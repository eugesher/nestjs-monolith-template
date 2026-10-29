import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { Maybe, Nullable } from '@acme-libs/toolkit';
import { IIdempotencyCommonKeyDraft } from '../interfaces/idempotency-common-key-draft.interface';
import { IIdempotencyCommonKeyRecord } from '../interfaces/idempotency-common-key-record.interface';

export class IdempotencyCommonKeyModel {
  private static readonly MAX_KEY_LENGTH = 128;
  private static readonly HOUR_MS = 60 * 60 * 1000;

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

  public static claim(draft: IIdempotencyCommonKeyDraft): IdempotencyCommonKeyModel {
    const { key, requestFingerprint } = draft;

    if (key.length === 0) {
      throw new Error('IdempotencyKey.key is required');
    }

    if (key.length > IdempotencyCommonKeyModel.MAX_KEY_LENGTH) {
      throw new Error('IdempotencyKey.key must be at most 128 characters');
    }

    return new IdempotencyCommonKeyModel(
      undefined,
      key,
      requestFingerprint,
      IdempotencyStatusEnum.IN_FLIGHT,
      null,
      undefined,
    );
  }

  public static reconstitute(record: IIdempotencyCommonKeyRecord): IdempotencyCommonKeyModel {
    const { id, key, requestFingerprint, status, responseBody, createdAt } = record;

    return new IdempotencyCommonKeyModel(
      id,
      key,
      requestFingerprint,
      status,
      responseBody,
      createdAt,
    );
  }

  public static expiryCutoff(now: Date, ttlHours: number): Date {
    const cutoffMs = now.getTime() - ttlHours * IdempotencyCommonKeyModel.HOUR_MS;

    return new Date(cutoffMs);
  }

  public matches(requestFingerprint: string): boolean {
    return this.requestFingerprint === requestFingerprint;
  }

  public isCompleted(): this is IdempotencyCommonKeyModel & { responseBody: string } {
    return this.status === IdempotencyStatusEnum.COMPLETED && this.responseBody !== null;
  }
}
