import { ProductStatusEnum } from '@acme-libs/kernel';

import { ProductGetManyModel } from '../product-get-many.model';

describe('ProductGetManyModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed product', () => {
      const data = ProductGetManyModel.toViewData([
        {
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          version: 2,
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          version: 2,
          createdAt: '2026-01-03T00:00:00.000Z',
          updatedAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(ProductGetManyModel.toViewData([])).toEqual([]);
    });
  });
});
