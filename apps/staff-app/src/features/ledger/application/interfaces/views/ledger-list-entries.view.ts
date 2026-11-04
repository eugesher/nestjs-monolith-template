import { IPage } from '@acme-libs/toolkit';

interface ILedgerListEntriesViewItem {
  id: string;
  operationKey: string;
  subjectType: string;
  subjectId: string;
  action: string;
  payload: Record<string, unknown>;
  correlationId: string;
  occurredAt: string;
  recordedAt: string;
}

export type ILedgerListEntriesView = IPage<ILedgerListEntriesViewItem>;
