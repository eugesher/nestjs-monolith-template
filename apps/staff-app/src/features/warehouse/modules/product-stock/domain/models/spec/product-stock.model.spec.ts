import { ProductStockAddedEvent } from '../../events/product-stock-added.event';
import { ProductStockModel } from '../product-stock.model';

describe('ProductStockModel', () => {
  describe('reconstitute', () => {
    it('restores the stock of a stored product without recording anything', () => {
      const stock = ProductStockModel.reconstitute({ productId: '12', sku: 'SKU-0001' });

      expect({ id: stock.id, sku: stock.sku }).toEqual({ id: '12', sku: 'SKU-0001' });
      expect(stock.pullDomainEvents()).toEqual([]);
    });
  });

  describe('add', () => {
    it('records the units added to the product', () => {
      const stock = ProductStockModel.reconstitute({ productId: '12', sku: 'SKU-0001' });

      stock.add(5);

      const events = stock.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(ProductStockAddedEvent);
      expect(events[0]).toMatchObject({ aggregateId: '12', sku: 'SKU-0001', quantity: 5 });
    });

    it.each([
      ['zero', 0],
      ['a negative quantity', -1],
      ['a fraction', 2.5],
      ['more than 100000', 100_001],
    ])('refuses %s with PRODUCT_QUANTITY_INVALID', (_, quantity) => {
      const stock = ProductStockModel.reconstitute({ productId: '12', sku: 'SKU-0001' });

      expect(() => stock.add(quantity)).toThrow(
        expect.objectContaining({
          code: 'PRODUCT_QUANTITY_INVALID',
          message: `Product restock quantity must be an integer from 1 to 100000, got ${quantity}`,
        }) as Error,
      );
    });
  });
});
