import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductModel, ProductUpdatedEvent } from '../../../domain';
import { ProductWriteService } from '../../services/product-write.service';
import { ProductUpdateUseCase } from '../product-update.use-case';

describe('ProductUpdateUseCase', () => {
  let write: jest.Mock;
  let invalidate: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductUpdateUseCase;

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
      events: [new ProductUpdatedEvent('12', { name: 'Desk lamp' }, { name: 'Lamp' })],
    });
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ProductUpdateUseCase(
      { write } as unknown as ProductWriteService,
      { invalidate },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('updates through the write service and answers the stored product', async () => {
      const view = await useCase.execute({
        productId: '12',
        name: 'Desk lamp',
        expectedVersion: 3,
      });

      expect(write).toHaveBeenCalledWith(
        { productId: '12', expectedVersion: 3 },
        expect.any(Function),
      );
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Desk lamp',
        status: 'active',
        version: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith({ productId: '12', version: 4 }, 'Product updated');
    });

    it('invalidates the customer catalog after the write', async () => {
      await useCase.execute({ productId: '12', name: 'Desk lamp', expectedVersion: 3 });

      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(write.mock.invocationCallOrder[0]).toBeLessThan(
        invalidate.mock.invocationCallOrder[0],
      );
    });

    it('invalidates nothing when the write fails', async () => {
      write.mockRejectedValue(new Error('PRODUCT_NOT_FOUND'));

      await expect(
        useCase.execute({ productId: '12', name: 'Desk lamp', expectedVersion: 3 }),
      ).rejects.toThrow('PRODUCT_NOT_FOUND');
      expect(invalidate).not.toHaveBeenCalled();
    });

    it('hands the write service a change that updates the name of the product', async () => {
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
