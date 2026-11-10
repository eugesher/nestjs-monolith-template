import { OrderSummaryModel } from '../order-summary.model';

describe('OrderSummaryModel', () => {
  describe('toSnapshot', () => {
    it('answers a listed order without its products', () => {
      const order = OrderSummaryModel.reconstitute({
        id: '600',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      });

      expect(order.toSnapshot()).toEqual({ id: '600', createdAt: '2026-01-03T00:00:00.000Z' });
    });
  });
});
