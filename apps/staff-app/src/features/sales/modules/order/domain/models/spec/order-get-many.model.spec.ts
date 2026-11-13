import { OrderGetManyModel } from '../order-get-many.model';

describe('OrderGetManyModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed order', () => {
      const data = OrderGetManyModel.toViewData([
        {
          id: '600',
          customerId: '101',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '600',
          customerId: '101',
          createdAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(OrderGetManyModel.toViewData([])).toEqual([]);
    });
  });
});
