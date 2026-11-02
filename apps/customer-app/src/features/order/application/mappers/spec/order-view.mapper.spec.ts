import { OrderViewMapper } from '../order-view.mapper';

describe('OrderViewMapper', () => {
  describe('toSummaryView', () => {
    it('maps a listed order without its products', () => {
      const view = OrderViewMapper.toSummaryView({
        id: '600',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      });

      expect(view).toEqual({ id: '600', createdAt: '2026-01-03T00:00:00.000Z' });
    });
  });
});
