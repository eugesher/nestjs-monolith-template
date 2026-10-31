import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductStockArchiveOutOfStockUseCase } from '../product-stock-archive-out-of-stock.use-case';

describe('ProductStockArchiveOutOfStockUseCase', () => {
  let outcomes: string[];
  let findActive: jest.Mock;
  let lock: jest.Mock;
  let archive: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductStockArchiveOutOfStockUseCase;

  beforeEach(() => {
    outcomes = [];
    findActive = jest.fn((productIds: string[]) => {
      outcomes.push('findActive');

      return Promise.resolve(productIds.filter((productId) => productId !== '102'));
    });
    lock = jest.fn(() => {
      outcomes.push('lock');

      return Promise.resolve([
        { productId: '100', quantity: 6 },
        { productId: '102', quantity: 0 },
        { productId: '106', quantity: 0 },
        { productId: '107', quantity: -1 },
      ]);
    });
    archive = jest.fn(() => {
      outcomes.push('archive');

      return Promise.resolve({ archived: true });
    });
    run = jest.fn(async (work: () => Promise<unknown>) => {
      outcomes.push('begin');

      const result = await work();

      outcomes.push('commit');

      return result;
    });
    logger = makePinoLoggerMock();
    useCase = new ProductStockArchiveOutOfStockUseCase(
      { findActive },
      { lock },
      { archive },
      { run, afterCommit: jest.fn() },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('locks the products and sums their stock before it reads their status', async () => {
      await useCase.execute({ productIds: ['100', '102', '106', '107'] });

      expect(lock).toHaveBeenCalledWith({ productIds: ['100', '102', '106', '107'] });
      expect(findActive).toHaveBeenCalledWith(['102', '106', '107']);
      expect(outcomes).toEqual(['begin', 'lock', 'findActive', 'archive', 'archive', 'commit']);
    });

    it('archives the published products that have no stock left and logs each one', async () => {
      await useCase.execute({ productIds: ['100', '102', '106', '107'] });

      expect(archive.mock.calls).toEqual([[{ productId: '106' }], [{ productId: '107' }]]);
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '106' },
        'Out-of-stock product archived',
      );
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '107' },
        'Out-of-stock product archived',
      );
    });

    it('leaves a draft without stock as it is', async () => {
      lock.mockResolvedValue([{ productId: '102', quantity: 0 }]);

      await useCase.execute({ productIds: ['102'] });

      expect(archive).not.toHaveBeenCalled();
    });

    it('logs nothing for a product the core module did not archive', async () => {
      archive.mockResolvedValue({ archived: false });

      await useCase.execute({ productIds: ['106'] });

      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
