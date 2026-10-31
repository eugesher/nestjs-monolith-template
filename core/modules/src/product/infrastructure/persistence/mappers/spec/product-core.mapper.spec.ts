import { Product } from '@acme-core/entities';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductCoreMapper } from '../product-core.mapper';

describe('ProductCoreMapper', () => {
  describe('toModel', () => {
    it('copies the id, the sku, the status and the version', () => {
      const product = ProductCoreMapper.toModel({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
      } as Product);

      expect(product.id).toBe('12');
      expect(product.sku).toBe('SKU-0001');
      expect(product.status).toBe('active');
      expect(product.version).toBe(3);
    });
  });
});
