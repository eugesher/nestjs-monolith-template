import { LedgerEntry } from '@acme-core/entities';
import { ILedgerStoredEntryView } from '../../../outbound';

export class LedgerEntryMapper {
  public static toView(entity: LedgerEntry): ILedgerStoredEntryView {
    return {
      id: entity.id,
      operationKey: entity.operationKey,
      subjectType: entity.subjectType,
      subjectId: entity.subjectId,
      action: entity.action,
      payload: entity.payload,
      correlationId: entity.correlationId,
      occurredAt: entity.occurredAt.toISOString(),
      recordedAt: entity.recordedAt.toISOString(),
    };
  }
}
