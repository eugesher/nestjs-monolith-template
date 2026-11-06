import { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import { OrderLedgerQueueAdapter } from '../order-ledger-queue.adapter';

describe('OrderLedgerQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: OrderLedgerQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new OrderLedgerQueueAdapter(
      { add } as unknown as Queue<ILedgerRecordProcessorPayload>,
      500,
    );
  });

  describe('enqueue', () => {
    it('adds the record with its correlation id as one job', async () => {
      await adapter.enqueue({
        operationKey: 'order-placed:600',
        subjectType: 'order',
        subjectId: '600',
        action: 'OrderPlaced',
        payload: { customerId: 'customer-1', productIds: ['100', '100'] },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(add).toHaveBeenCalledWith({
        operationKey: 'order-placed:600',
        subjectType: 'order',
        subjectId: '600',
        action: 'OrderPlaced',
        payload: { customerId: 'customer-1', productIds: ['100', '100'] },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
