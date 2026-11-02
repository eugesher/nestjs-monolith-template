import { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { ProductLedgerRecordQueueAdapter } from '../product-ledger-record-queue.adapter';

describe('ProductLedgerRecordQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: ProductLedgerRecordQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new ProductLedgerRecordQueueAdapter(
      { add } as unknown as Queue<ILedgerRecordProcessorPayload>,
      500,
    );
  });

  describe('enqueue', () => {
    it('adds the record with its correlation id as one job', async () => {
      await adapter.enqueue({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001', name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(add).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001', name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
