import { ILedgerCoreEntryDraft } from '../interfaces/ledger-core-entry-draft.interface';

export class LedgerCoreEntryModel {
  private constructor(
    public readonly operationKey: string,
    public readonly subjectType: string,
    public readonly subjectId: string,
    public readonly action: string,
    public readonly payload: Record<string, unknown>,
    public readonly correlationId: string,
    public readonly occurredAt: Date,
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
      key,
      subjectType,
      subjectId,
      verb,
      payload,
      correlationId,
      occurredAt,
    );
  }
}
