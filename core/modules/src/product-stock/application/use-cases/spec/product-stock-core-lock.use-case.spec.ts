import { ProductStockCoreLockUseCase } from '../product-stock-core-lock.use-case';

describe('ProductStockCoreLockUseCase', () => {
  let lockProducts: jest.Mock;
  let sumStock: jest.Mock;
  let useCase: ProductStockCoreLockUseCase;

  beforeEach(() => {
    lockProducts = jest.fn().mockResolvedValue(['100', '103']);
    sumStock = jest.fn().mockResolvedValue([
      { productId: '100', quantity: 8 },
      { productId: '103', quantity: 0 },
    ]);
    useCase = new ProductStockCoreLockUseCase({ lockProducts, sumStock });
  });

  describe('execute', () => {
    it('locks the products first and sums the stock of the locked ones', async () => {
      const onHand = await useCase.execute({ productIds: ['103', '100', '999'] });

      expect(lockProducts).toHaveBeenCalledWith(['103', '100', '999']);
      expect(sumStock).toHaveBeenCalledWith(['100', '103']);
      expect(lockProducts.mock.invocationCallOrder[0]).toBeLessThan(
        sumStock.mock.invocationCallOrder[0],
      );
      expect(onHand).toEqual([
        { productId: '100', quantity: 8 },
        { productId: '103', quantity: 0 },
      ]);
    });
  });
});
