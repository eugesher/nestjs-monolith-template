import { LedgerEntry } from '@acme-core/entities';

export type ILedgerAppendEntryInsertQuery = Pick<
  LedgerEntry,
  | 'operationKey'
  | 'subjectType'
  | 'subjectId'
  | 'action'
  | 'payload'
  | 'correlationId'
  | 'occurredAt'
>;
