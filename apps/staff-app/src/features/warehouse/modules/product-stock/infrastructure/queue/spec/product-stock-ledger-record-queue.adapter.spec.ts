import type { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';
import { ProductStockLedgerRecordQueueAdapter } from '../product-stock-ledger-record-queue.adapter';

describe('ProductStockLedgerRecordQueueAdapter', () => {
  let add: jest.Mock;
  let adapter: ProductStockLedgerRecordQueueAdapter;

  beforeEach(() => {
    add = jest.fn().mockResolvedValue({ id: '1' });
    adapter = new ProductStockLedgerRecordQueueAdapter(
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
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
        payload: { sku: 'SKU-0001', quantity: 5 },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(add).toHaveBeenCalledWith({
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
        payload: { sku: 'SKU-0001', quantity: 5 },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });

    it('passes a failing add through', async () => {
      add.mockRejectedValue(new Error('redis is down'));

      const enqueueing = adapter.enqueue({
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
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
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
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
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
