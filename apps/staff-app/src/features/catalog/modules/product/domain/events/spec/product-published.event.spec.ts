import { ProductStatusEnum } from '@acme-libs/kernel';

import { ProductPublishedEvent } from '../product-published.event';

describe('ProductPublishedEvent', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('toLedgerRecord', () => {
    it('answers the ledger record of the publication under the product and its version', () => {
      const event = new ProductPublishedEvent('12', 'SKU-0001', 6, ProductStatusEnum.ARCHIVED);

      expect(event.toLedgerRecord()).toEqual({
        operationKey: 'product-published:12:6',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductPublished',
        payload: { sku: 'SKU-0001', previousStatus: 'archived' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });
});
