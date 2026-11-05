import { LedgerEntry } from '@acme-core/entities';

export type ILedgerListEntriesRecordItem = Pick<
  LedgerEntry,
  | 'id'
  | 'operationKey'
  | 'subjectType'
  | 'subjectId'
  | 'action'
  | 'payload'
  | 'correlationId'
  | 'occurredAt'
  | 'recordedAt'
>;

export type ILedgerListEntriesRecord = [ILedgerListEntriesRecordItem[], number];
