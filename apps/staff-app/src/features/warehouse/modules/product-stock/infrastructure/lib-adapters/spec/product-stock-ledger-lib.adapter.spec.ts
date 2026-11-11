import { CorrelationContextHelper } from '@acme-libs/observability';

import { IProductStockLedgerRecordEventsCommand } from '../../../outbound';
import { ProductStockLedgerLibAdapter } from '../product-stock-ledger-lib.adapter';

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

      await CorrelationContextHelper.run('corr-1', () =>
        adapter.recordEvents({ productStockId: '700', events: [event] }),
      );

      expect(toLedgerRecord).toHaveBeenCalledWith('700', 'corr-1');
      expect(handleEnqueue).toHaveBeenCalledWith(record);
    });
  });
});
