import { CorrelationContextHelper } from '@acme-libs/observability';

import { OrderLedgerLibAdapter } from '../order-ledger-lib.adapter';

describe('OrderLedgerLibAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: OrderLedgerLibAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new OrderLedgerLibAdapter({ handleEnqueue });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordPlaced', () => {
    it('enqueues the placed order under the operation key and correlation id', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        adapter.recordPlaced({
          orderId: '610',
          customerId: 'customer-1',
          productIds: ['100', '100'],
        }),
      );

      expect(handleEnqueue).toHaveBeenCalledTimes(1);
      expect(handleEnqueue).toHaveBeenCalledWith({
        operationKey: 'order-placed:610',
        subjectType: 'order',
        subjectId: '610',
        action: 'OrderPlaced',
        payload: { customerId: 'customer-1', productIds: ['100', '100'] },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'corr-1',
      });
    });
  });
});
