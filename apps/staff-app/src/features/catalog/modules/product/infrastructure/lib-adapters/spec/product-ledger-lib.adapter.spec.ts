import { CorrelationContextHelper } from '@acme-libs/observability';

import { ProductLedgerLibAdapter } from '../product-ledger-lib.adapter';
import type { IProductLedgerRecordEventsCommand } from '../../../outbound';

describe('ProductLedgerLibAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: ProductLedgerLibAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new ProductLedgerLibAdapter({ handleEnqueue });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordCreated', () => {
    it('enqueues a creation under the stored id with the correlation id', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        adapter.recordCreated({ productId: '12', sku: 'SKU-0001', name: 'Lamp' }),
      );

      expect(handleEnqueue).toHaveBeenCalledWith({
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

  describe('recordEvents', () => {
    it('enqueues the record each event builds with the correlation id', async () => {
      const record = { operationKey: 'product-published:12:6' };
      const toLedgerRecord = jest.fn().mockReturnValue(record);
      const event = { toLedgerRecord } as unknown as IProductLedgerRecordEventsCommand['events'][0];

      await CorrelationContextHelper.run('corr-1', () => adapter.recordEvents({ events: [event] }));

      expect(toLedgerRecord).toHaveBeenCalledWith('corr-1');
      expect(handleEnqueue).toHaveBeenCalledWith(record);
    });
  });
});
