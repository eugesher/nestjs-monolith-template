import { PinoLogger } from 'nestjs-pino';

import { ProductStockCoreMovementKindEnum } from '@acme-core/contracts/product-stock';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductStockCoreMoveUseCase } from '../product-stock-core-move.use-case';

describe('ProductStockCoreMoveUseCase', () => {
  let lockProducts: jest.Mock;
  let insertMany: jest.Mock;
  let sumStock: jest.Mock;
  let enqueue: jest.Mock;
  let afterCommit: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductStockCoreMoveUseCase;

  beforeEach(() => {
    lockProducts = jest.fn().mockResolvedValue(['100', '103']);
    insertMany = jest.fn().mockResolvedValue(['700', '701', '702']);
    sumStock = jest.fn().mockResolvedValue([
      { productId: '100', quantity: 6 },
      { productId: '103', quantity: 2 },
    ]);
    enqueue = jest.fn().mockResolvedValue(undefined);
    afterCommit = jest.fn();
    logger = makePinoLoggerMock();
    useCase = new ProductStockCoreMoveUseCase(
      { lockProducts, insertMany, sumStock },
      { enqueue },
      { run: jest.fn(), afterCommit },
      2,
      logger as unknown as PinoLogger,
    );
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

    it('announces the subtracted products after the commit, under the correlation id of the request', async () => {
      await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({
          kind: ProductStockCoreMovementKindEnum.SUBTRACT,
          movements: [
            { productId: '100', quantity: 1, orderProductId: '620' },
            { productId: '100', quantity: 1, orderProductId: '621' },
          ],
        }),
      );

      const [hook] = afterCommit.mock.calls[0] as [() => Promise<void>];

      expect(enqueue).not.toHaveBeenCalled();

      await hook();

      expect(enqueue).toHaveBeenCalledWith({ productIds: ['100'], correlationId: 'corr-1' });
    });

    it('retries a failed announcement and logs it for a replay once the budget is spent', async () => {
      enqueue.mockRejectedValue(new Error('redis is down'));

      await CorrelationContextHelper.run('corr-1', () =>
        useCase.execute({
          kind: ProductStockCoreMovementKindEnum.SUBTRACT,
          movements: [{ productId: '100', quantity: 1, orderProductId: '620' }],
        }),
      );

      const [hook] = afterCommit.mock.calls[0] as [() => Promise<void>];

      await hook();

      expect(enqueue).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(
        { err: new Error('redis is down'), correlationId: 'corr-1', productIds: ['100'] },
        'Post-subtract enqueue failed permanently: the out-of-stock check of these products did not run, replay it',
      );
    });

    it('announces nothing for an addition', async () => {
      await useCase.execute({
        kind: ProductStockCoreMovementKindEnum.ADD,
        movements: [{ productId: '100', quantity: 5, orderProductId: null }],
      });

      expect(afterCommit).not.toHaveBeenCalled();
    });
  });
});
