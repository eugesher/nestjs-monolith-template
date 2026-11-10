import { OrderSummaryModel } from '../order-summary.model';

describe('OrderSummaryModel', () => {
  describe('toSnapshot', () => {
    it('answers a listed order with its owner and without its products', () => {
      const order = OrderSummaryModel.reconstitute({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      });

      expect(order.toSnapshot()).toEqual({
        id: '600',
        customerId: 'customer-1',
        createdAt: '2026-01-03T00:00:00.000Z',
      });
    });
  });
});
