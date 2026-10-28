import { ILedgerCoreEntryView } from '@acme-core/contracts/ledger';
import { LedgerCoreEntryModel } from '../../domain';

export class LedgerCoreEntryViewMapper {
  public static toView(entry: LedgerCoreEntryModel): ILedgerCoreEntryView {
    const recordedAt = entry.recordedAt ?? entry.occurredAt;

    return {
      id: entry.id ?? '',
      operationKey: entry.operationKey,
      subjectType: entry.subjectType,
      subjectId: entry.subjectId,
      action: entry.action,
      payload: entry.payload,
      correlationId: entry.correlationId,
      occurredAt: entry.occurredAt.toISOString(),
      recordedAt: recordedAt.toISOString(),
    };
  }
}
