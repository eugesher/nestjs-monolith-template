import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import type { Nullable } from '@acme-libs/toolkit';

import type {
  IIdempotencyCoreKeyCandidateInput,
  IIdempotencyCoreKeyDraftOutput,
  IIdempotencyCoreKeyRecordInput,
} from '../interfaces';

export class IdempotencyCoreKeyModel {
  private static readonly MAX_KEY_LENGTH = 128;

  private constructor(
    public readonly requestFingerprint: string,
    public readonly status: IdempotencyStatusEnum,
    public readonly responseBody: Nullable<string>,
  ) {
    Object.freeze(this);
  }

  public static reconstitute(record: IIdempotencyCoreKeyRecordInput): IdempotencyCoreKeyModel {
    const { requestFingerprint, status, responseBody } = record;

    return new IdempotencyCoreKeyModel(requestFingerprint, status, responseBody);
  }

  public static createDraft(
    candidate: IIdempotencyCoreKeyCandidateInput,
  ): IIdempotencyCoreKeyDraftOutput {
    const { scope, key, requestFingerprint } = candidate;

    if (key.length === 0) {
      throw new Error('IdempotencyKey.key is required');
    }

    if (key.length > IdempotencyCoreKeyModel.MAX_KEY_LENGTH) {
      throw new Error('IdempotencyKey.key must be at most 128 characters');
    }

    return {
      scope,
      key,
      requestFingerprint,
      status: IdempotencyStatusEnum.IN_FLIGHT,
      responseBody: null,
    };
  }

  public matches(requestFingerprint: string): boolean {
    return this.requestFingerprint === requestFingerprint;
  }

  public isCompleted(): this is IdempotencyCoreKeyModel & { responseBody: string } {
    return this.status === IdempotencyStatusEnum.COMPLETED && this.responseBody !== null;
  }
}
