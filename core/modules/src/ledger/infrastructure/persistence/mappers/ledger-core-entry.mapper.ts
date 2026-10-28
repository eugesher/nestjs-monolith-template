import { LedgerEntry } from '@acme-core/entities';
import { LedgerCoreEntryModel } from '../../../domain';

export class LedgerCoreEntryMapper {
  public static toModel(entry: LedgerEntry): LedgerCoreEntryModel {
    return LedgerCoreEntryModel.reconstitute({
      id: entry.id,
      operationKey: entry.operationKey,
      subjectType: entry.subjectType,
      subjectId: entry.subjectId,
      action: entry.action,
      payload: entry.payload,
      correlationId: entry.correlationId,
      occurredAt: entry.occurredAt,
      recordedAt: entry.recordedAt,
    });
  }
}
