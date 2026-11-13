import { ProductStockAddedEvent } from '../product-stock-added.event';

describe('ProductStockAddedEvent', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('toLedgerRecord', () => {
    it('answers the ledger record of the addition under the product and its stock row', () => {
      const event = new ProductStockAddedEvent('12', 'SKU-0001', 5);

      expect(event.toLedgerRecord('700')).toEqual({
        operationKey: 'product-restocked:700',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductRestocked',
        payload: { sku: 'SKU-0001', quantity: 5 },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });
});
