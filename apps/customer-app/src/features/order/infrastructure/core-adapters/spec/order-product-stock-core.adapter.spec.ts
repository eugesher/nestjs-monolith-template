import { OrderProductStockCoreAdapter } from '../order-product-stock-core.adapter';

describe('OrderProductStockCoreAdapter', () => {
  let lock: jest.Mock;
  let move: jest.Mock;
  let adapter: OrderProductStockCoreAdapter;

  beforeEach(() => {
    lock = jest.fn().mockResolvedValue([{ productId: '100', quantity: 8 }]);
    move = jest.fn().mockResolvedValue({
      productStockIds: ['700', '701'],
      stock: [{ productId: '100', quantity: 6 }],
    });
    adapter = new OrderProductStockCoreAdapter({ lock, move });
  });

  describe('lock', () => {
    it('locks the products through the core module and answers their stock', async () => {
      const stock = await adapter.lock({ productIds: ['100'] });

      expect(lock).toHaveBeenCalledWith({ productIds: ['100'] });
      expect(stock).toEqual([{ productId: '100', quantity: 8 }]);
    });
  });

  describe('withdraw', () => {
    it('subtracts one unit per order line through the core module and answers nothing', async () => {
      const result = await adapter.withdraw({
        movements: [
          { productId: '100', orderProductId: '620' },
          { productId: '100', orderProductId: '621' },
        ],
      });

      expect(move).toHaveBeenCalledWith({
        kind: 'subtract',
        movements: [
          { productId: '100', quantity: 1, orderProductId: '620' },
          { productId: '100', quantity: 1, orderProductId: '621' },
        ],
      });
      expect(result).toBeUndefined();
    });
  });
});
