import { Product } from '@acme-core/entities';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductMapper } from '../product.mapper';

describe('ProductMapper', () => {
  describe('toModel', () => {
    it('restores the row as a product with its string id and stored times', () => {
      const row = Object.assign(new Product(), {
        id: '12',
        sku: 'SKU-0001',
        name: 'Reference product',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
      });

      const product = ProductMapper.toModel(row);

      expect({
        id: product.id,
        sku: product.sku,
        name: product.name,
        status: product.status,
        version: product.version,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Reference product',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });
      expect(product.pullDomainEvents()).toEqual([]);
    });
  });
});
