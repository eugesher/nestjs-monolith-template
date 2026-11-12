import { ProductStatusEnum } from '@acme-libs/kernel';
import { CorrelationContextHelper } from '@acme-libs/observability';

import { ProductCoreLedgerLibAdapter } from '../product-core-ledger-lib.adapter';

describe('ProductCoreLedgerLibAdapter', () => {
  let handleEnqueue: jest.Mock;
  let adapter: ProductCoreLedgerLibAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
    handleEnqueue = jest.fn().mockResolvedValue(undefined);
    adapter = new ProductCoreLedgerLibAdapter({ handleEnqueue });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('recordArchived', () => {
    it('enqueues the archive under the product and the version it produced', async () => {
      await CorrelationContextHelper.run('c0ffee00-0000-4000-8000-000000000001', () =>
        adapter.recordArchived({
          productId: '12',
          sku: 'SKU-0001',
          version: 4,
          previousStatus: ProductStatusEnum.ACTIVE,
        }),
      );

      expect(handleEnqueue).toHaveBeenCalledTimes(1);
      expect(handleEnqueue).toHaveBeenCalledWith({
        operationKey: 'product-archived:12:4',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
        correlationId: 'c0ffee00-0000-4000-8000-000000000001',
      });
    });
  });
});
