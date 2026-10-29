import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductModel, ProductRenamedEvent } from '../../../domain';
import { ProductWriteService } from '../../services/product-write.service';
import { ProductRenameUseCase } from '../product-rename.use-case';

describe('ProductRenameUseCase', () => {
  let write: jest.Mock;
  let publish: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductRenameUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue({
      product: ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Desk lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      events: [new ProductRenamedEvent('12', 'Desk lamp', 'Lamp')],
    });
    publish = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ProductRenameUseCase(
      { write } as unknown as ProductWriteService,
      { publish },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('renames through the write service, publishes the events and answers the stored product', async () => {
      const view = await useCase.execute({
        productId: '12',
        name: 'Desk lamp',
        expectedVersion: 3,
      });

      expect(write).toHaveBeenCalledWith(
        { productId: '12', expectedVersion: 3 },
        expect.any(Function),
      );
      expect(publish).toHaveBeenCalledWith({
        productId: '12',
        events: [expect.any(ProductRenamedEvent)],
      });
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Desk lamp',
        status: 'active',
        version: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith({ productId: '12', version: 4 }, 'Product renamed');
    });

    it('hands the write service a change that renames the product', async () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await useCase.execute({
        productId: '12',
        name: 'Desk lamp',
        expectedVersion: undefined,
      });

      const [, mutate] = write.mock.calls[0] as [unknown, (product: ProductModel) => void];

      mutate(product);

      expect(product.name).toBe('Desk lamp');
    });
  });
});
