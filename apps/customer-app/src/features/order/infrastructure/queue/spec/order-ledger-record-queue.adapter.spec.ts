import type { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';
import { OrderLedgerRecordQueueAdapter } from '../order-ledger-record-queue.adapter';

describe('OrderLedgerRecordQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: OrderLedgerRecordQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new OrderLedgerRecordQueueAdapter(
      { add } as unknown as Queue<ILedgerRecordProcessorPayload>,
      500,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
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

    it('passes a failing add through', async () => {
      add.mockRejectedValue(new Error('redis is down'));

      const enqueueing = adapter.enqueue({
        operationKey: 'order-placed:600',
        subjectType: 'order',
        subjectId: '600',
        action: 'OrderPlaced',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      await expect(enqueueing).rejects.toThrow('redis is down');
    });

    it('gives up on an add that hangs, as Bull does while Redis is down', async () => {
      jest.useFakeTimers();
      add.mockReturnValue(new Promise(() => undefined));

      const enqueueing = adapter.enqueue({
        operationKey: 'order-placed:600',
        subjectType: 'order',
        subjectId: '600',
        action: 'OrderPlaced',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      jest.advanceTimersByTime(500);

      await expect(enqueueing).rejects.toThrow('Enqueue timed out after 500 ms');
    });

    it('clears the timer once the add settles', async () => {
      jest.useFakeTimers();

      await adapter.enqueue({
        operationKey: 'order-placed:600',
        subjectType: 'order',
        subjectId: '600',
        action: 'OrderPlaced',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
