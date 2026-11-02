import { ILedgerRecordEntryCandidate } from '../interfaces/ledger-record-entry-candidate.interface';
import { ILedgerRecordEntryDraft } from '../interfaces/ledger-record-entry-draft.interface';

export class LedgerRecordEntryModel {
  public static createDraft(candidate: ILedgerRecordEntryCandidate): ILedgerRecordEntryDraft {
    const { operationKey, subjectType, subjectId, action, payload, correlationId, occurredAt } =
      candidate;
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

    return {
      operationKey: key,
      subjectType,
      subjectId,
      action: verb,
      payload,
      correlationId,
      occurredAt,
    };
  }
}
