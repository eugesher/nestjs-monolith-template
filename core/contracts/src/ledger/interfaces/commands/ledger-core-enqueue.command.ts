import type { ILedgerRecordProcessorPayload } from '../../queues/ledger-record.queue';

export type ILedgerCoreEnqueueCommand = Omit<ILedgerRecordProcessorPayload, 'correlationId'>;
