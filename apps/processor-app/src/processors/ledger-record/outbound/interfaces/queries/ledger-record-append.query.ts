import { LedgerEntry } from '@acme-core/entities';

export type ILedgerRecordAppendEntryInsertQuery = Pick<
  LedgerEntry,
  | 'operationKey'
  | 'subjectType'
  | 'subjectId'
  | 'action'
  | 'payload'
  | 'correlationId'
  | 'occurredAt'
>;
