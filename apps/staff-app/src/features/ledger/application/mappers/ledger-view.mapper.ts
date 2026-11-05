import { ILedgerListEntriesRecordItem } from '../../outbound';
import { ILedgerListEntriesView } from '../interfaces';

export class LedgerViewMapper {
  public static toListEntriesViewItem(
    entry: ILedgerListEntriesRecordItem,
  ): ILedgerListEntriesView['data'][number] {
    return {
      id: entry.id,
      operationKey: entry.operationKey,
      subjectType: entry.subjectType,
      subjectId: entry.subjectId,
      action: entry.action,
      payload: entry.payload,
      correlationId: entry.correlationId,
      occurredAt: entry.occurredAt.toISOString(),
      recordedAt: entry.recordedAt.toISOString(),
    };
  }
}
