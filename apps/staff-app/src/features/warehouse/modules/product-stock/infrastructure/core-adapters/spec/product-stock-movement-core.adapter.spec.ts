import { ProductStockMovementCoreAdapter } from '../product-stock-movement-core.adapter';

describe('ProductStockMovementCoreAdapter', () => {
  let handleLock: jest.Mock;
  let handleMove: jest.Mock;
  let adapter: ProductStockMovementCoreAdapter;

  beforeEach(() => {
    handleLock = jest.fn().mockResolvedValue([{ productId: '12', quantity: 10 }]);
    handleMove = jest.fn().mockResolvedValue({
      productStockIds: ['700'],
      stock: [{ productId: '12', quantity: 15 }],
    });
    adapter = new ProductStockMovementCoreAdapter({ handleLock, handleMove });
  });

  describe('lock', () => {
    it('locks the one product through the core module and keeps its stock to itself', async () => {
      await expect(adapter.lock({ productId: '12' })).resolves.toBeUndefined();

      expect(handleLock).toHaveBeenCalledWith({ productIds: ['12'] });
    });

    it('lets a failed lock reject', async () => {
      handleLock.mockRejectedValue(new Error('lock wait timeout'));

      await expect(adapter.lock({ productId: '12' })).rejects.toThrow('lock wait timeout');
    });
  });

  describe('add', () => {
    it('adds the units without an order line and answers the new row and the stock', async () => {
      const view = await adapter.add({ productId: '12', quantity: 5 });

      expect(handleMove).toHaveBeenCalledWith({
        kind: 'add',
        movements: [{ productId: '12', quantity: 5, orderProductId: null }],
      });
      expect(view).toEqual({ productStockId: '700', quantity: 15 });
    });
  });
});
