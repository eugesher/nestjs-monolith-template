import { CorrelationContextHelper } from '@acme-libs/observability';

import { ProductStockLedgerLibAdapter } from '../product-stock-ledger-lib.adapter';
import type { IProductStockLedgerRecordEventsCommand } from '../../../outbound';

describe('ProductStockLedgerLibAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: ProductStockLedgerLibAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new ProductStockLedgerLibAdapter({ handleEnqueue });
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

      await CorrelationContextHelper.run('c0ffee00-0000-4000-8000-000000000001', () =>
        adapter.recordEvents({ productStockId: '700', events: [event] }),
      );

      expect(toLedgerRecord).toHaveBeenCalledWith('700', 'c0ffee00-0000-4000-8000-000000000001');
      expect(handleEnqueue).toHaveBeenCalledWith(record);
    });
  });
});
