import { ProductStockCoreMovementKindEnum } from '@acme-core/contracts/product-stock';
import { ProductStockCoreMoveUseCase } from '../product-stock-core-move.use-case';

describe('ProductStockCoreMoveUseCase', () => {
  let lockProducts: jest.Mock;
  let insertMany: jest.Mock;
  let sumStock: jest.Mock;
  let useCase: ProductStockCoreMoveUseCase;

  beforeEach(() => {
    lockProducts = jest.fn().mockResolvedValue(['100', '103']);
    insertMany = jest.fn().mockResolvedValue(['700', '701', '702']);
    sumStock = jest.fn().mockResolvedValue([
      { productId: '100', quantity: 6 },
      { productId: '103', quantity: 2 },
    ]);
    useCase = new ProductStockCoreMoveUseCase({ lockProducts, insertMany, sumStock });
  });

  describe('execute', () => {
    it('locks the distinct products, adds as positive rows and answers the rows and the stock', async () => {
      const view = await useCase.execute({
        kind: ProductStockCoreMovementKindEnum.ADD,
        movements: [
          { productId: '100', quantity: 5, orderProductId: null },
          { productId: '103', quantity: 2, orderProductId: null },
          { productId: '100', quantity: 1, orderProductId: null },
        ],
      });

      expect(lockProducts).toHaveBeenCalledWith(['100', '103']);
      expect(insertMany).toHaveBeenCalledWith([
        { productId: '100', quantity: 5, orderProductId: null },
        { productId: '103', quantity: 2, orderProductId: null },
        { productId: '100', quantity: 1, orderProductId: null },
      ]);
      expect(sumStock).toHaveBeenCalledWith(['100', '103']);
      expect(view).toEqual({
        productStockIds: ['700', '701', '702'],
        stock: [
          { productId: '100', quantity: 6 },
          { productId: '103', quantity: 2 },
        ],
      });
    });

    it('subtracts as negative rows', async () => {
      await useCase.execute({
        kind: ProductStockCoreMovementKindEnum.SUBTRACT,
        movements: [
          { productId: '100', quantity: 1, orderProductId: '620' },
          { productId: '103', quantity: 1, orderProductId: '621' },
        ],
      });

      expect(insertMany).toHaveBeenCalledWith([
        { productId: '100', quantity: -1, orderProductId: '620' },
        { productId: '103', quantity: -1, orderProductId: '621' },
      ]);
    });

    it('takes the locks before it writes and sums after the write', async () => {
      await useCase.execute({
        kind: ProductStockCoreMovementKindEnum.ADD,
        movements: [{ productId: '100', quantity: 5, orderProductId: null }],
      });

      expect(lockProducts.mock.invocationCallOrder[0]).toBeLessThan(
        insertMany.mock.invocationCallOrder[0],
      );
      expect(insertMany.mock.invocationCallOrder[0]).toBeLessThan(
        sumStock.mock.invocationCallOrder[0],
      );
    });
  });
});
