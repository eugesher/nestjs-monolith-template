import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductModel } from '../../../domain';
import { ProductViewMapper } from '../product-view.mapper';

describe('ProductViewMapper', () => {
  describe('toView', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('answers a stored product with ISO instants', () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      const view = ProductViewMapper.toView(product);

      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'active',
        version: 3,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      });
    });

    it('answers a product not stored yet with an empty id and the current instant', () => {
      jest.useFakeTimers({ now: new Date('2026-03-01T10:00:00.000Z') });

      const product = ProductModel.create({ sku: 'SKU-0001', name: 'Lamp' });

      const view = ProductViewMapper.toView(product);

      expect(view).toEqual({
        id: '',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'draft',
        version: 1,
        createdAt: '2026-03-01T10:00:00.000Z',
        updatedAt: '2026-03-01T10:00:00.000Z',
      });
    });
  });
});
