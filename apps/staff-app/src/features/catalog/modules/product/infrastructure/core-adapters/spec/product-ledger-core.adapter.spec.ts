import { ProductLedgerCoreAdapter } from '../product-ledger-core.adapter';
import type { IProductLedgerRecordEventsCommand } from '../../../outbound';

describe('ProductLedgerCoreAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: ProductLedgerCoreAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new ProductLedgerCoreAdapter({ handleEnqueue });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordCreated', () => {
    it('enqueues a creation under the stored id', async () => {
      await adapter.recordCreated({ productId: '12', sku: 'SKU-0001', name: 'Lamp' });

      expect(handleEnqueue).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001', name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });

  describe('recordEvents', () => {
    it('enqueues the record each event builds', async () => {
      const record = { operationKey: 'product-published:12:6' };
      const toLedgerRecord = jest.fn().mockReturnValue(record);
      const event = { toLedgerRecord } as unknown as IProductLedgerRecordEventsCommand['events'][0];

      await adapter.recordEvents({ events: [event] });

      expect(toLedgerRecord).toHaveBeenCalledWith();
      expect(handleEnqueue).toHaveBeenCalledWith(record);
    });

    it('stops at a failed enqueue and rejects', async () => {
      handleEnqueue.mockRejectedValueOnce(new Error('redis is down'));
      const first = {
        toLedgerRecord: jest.fn().mockReturnValue({ operationKey: 'product-published:12:6' }),
      } as unknown as IProductLedgerRecordEventsCommand['events'][0];
      const second = {
        toLedgerRecord: jest.fn().mockReturnValue({ operationKey: 'product-unpublished:12:7' }),
      } as unknown as IProductLedgerRecordEventsCommand['events'][0];

      const record = adapter.recordEvents({ events: [first, second] });

      await expect(record).rejects.toThrow('redis is down');
      expect(handleEnqueue).toHaveBeenCalledTimes(1);
    });
  });
});
