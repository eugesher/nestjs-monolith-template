import { Product } from '@acme-core/entities';
import { ProductStockMapper } from '../product-stock.mapper';

describe('ProductStockMapper', () => {
  describe('toModel', () => {
    it('restores the stock of the product row under its string id', () => {
      const row = Object.assign(new Product(), { id: '12', sku: 'SKU-0001' });

      const stock = ProductStockMapper.toModel(row);

      expect({ id: stock.id, sku: stock.sku }).toEqual({ id: '12', sku: 'SKU-0001' });
      expect(stock.pullDomainEvents()).toEqual([]);
    });
  });
});
