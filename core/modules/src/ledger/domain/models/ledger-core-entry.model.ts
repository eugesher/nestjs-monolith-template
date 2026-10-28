import { Maybe } from '@acme-libs/toolkit';
import { ILedgerCoreEntryDraft } from '../interfaces/ledger-core-entry-draft.interface';
import { ILedgerCoreEntryRecord } from '../interfaces/ledger-core-entry-record.interface';

export class LedgerCoreEntryModel {
  private constructor(
    public readonly id: Maybe<string>,
    public readonly operationKey: string,
    public readonly subjectType: string,
    public readonly subjectId: string,
    public readonly action: string,
    public readonly payload: Record<string, unknown>,
    public readonly correlationId: string,
    public readonly occurredAt: Date,
    public readonly recordedAt: Maybe<Date>,
  ) {
    Object.freeze(this);
  }

  public static create(draft: ILedgerCoreEntryDraft): LedgerCoreEntryModel {
    const { operationKey, subjectType, subjectId, action, payload, correlationId, occurredAt } =
      draft;
    const key = operationKey.trim();
    const verb = action.trim();

    if (key.length === 0) {
      throw new Error('LedgerEntry.operationKey is required');
    }

    if (verb.length === 0) {
      throw new Error('LedgerEntry.action is required');
    }

    if (Number.isNaN(occurredAt.getTime())) {
      throw new Error('LedgerEntry.occurredAt must be a valid instant');
    }

    return new LedgerCoreEntryModel(
      undefined,
      key,
      subjectType,
      subjectId,
      verb,
      payload,
      correlationId,
      occurredAt,
      undefined,
    );
  }

  public static reconstitute(record: ILedgerCoreEntryRecord): LedgerCoreEntryModel {
    const {
      id,
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt,
      recordedAt,
    } = record;

    return new LedgerCoreEntryModel(
      id,
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      correlationId,
      occurredAt,
      recordedAt,
    );
  }
}
