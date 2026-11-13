import { ProductStockLedgerCoreAdapter } from '../product-stock-ledger-core.adapter';
import type { IProductStockLedgerRecordEventsCommand } from '../../../outbound';

describe('ProductStockLedgerCoreAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: ProductStockLedgerCoreAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new ProductStockLedgerCoreAdapter({ handleEnqueue });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordEvents', () => {
    it('enqueues the record each event builds under its stock row', async () => {
      const record = { operationKey: 'product-restocked:700' };
      const toLedgerRecord = jest.fn().mockReturnValue(record);
      const event = {
        toLedgerRecord,
      } as unknown as IProductStockLedgerRecordEventsCommand['events'][0];

      await adapter.recordEvents({ productStockId: '700', events: [event] });

      expect(toLedgerRecord).toHaveBeenCalledWith('700');
      expect(handleEnqueue).toHaveBeenCalledWith(record);
    });

    it('stops at a failed enqueue and rejects', async () => {
      handleEnqueue.mockRejectedValueOnce(new Error('redis is down'));
      const first = {
        toLedgerRecord: jest.fn().mockReturnValue({ operationKey: 'product-restocked:700' }),
      } as unknown as IProductStockLedgerRecordEventsCommand['events'][0];
      const second = {
        toLedgerRecord: jest.fn().mockReturnValue({ operationKey: 'product-out-of-stock:700' }),
      } as unknown as IProductStockLedgerRecordEventsCommand['events'][0];

      const record = adapter.recordEvents({ productStockId: '700', events: [first, second] });

      await expect(record).rejects.toThrow('redis is down');
      expect(handleEnqueue).toHaveBeenCalledTimes(1);
    });
  });
});
