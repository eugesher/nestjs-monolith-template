import type { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { ProductModel, ProductPublishedEvent, ProductUpdatedEvent } from '../../../domain';
import { ProductPublishUseCase } from '../product-publish.use-case';
import type { IProductLedgerPort } from '../../../outbound';
import type { ProductWriteService } from '../../services/product-write.service';

describe('ProductPublishUseCase', () => {
  let write: jest.Mock;
  let recordEvents: jest.Mock;
  let invalidate: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductPublishUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue({
      product: ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      events: [new ProductPublishedEvent('12', 'SKU-0001', 2, ProductStatusEnum.DRAFT)],
    });
    recordEvents = jest.fn().mockResolvedValue(undefined);
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ProductPublishUseCase(
      { write } as unknown as ProductWriteService,
      { invalidate },
      { recordEvents } as unknown as IProductLedgerPort,
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('publishes, enqueues the ledger records and answers the stored product', async () => {
      const view = await useCase.execute({ productId: '12', expectedVersion: 1 });

      expect(write).toHaveBeenCalledWith(
        { productId: '12', expectedVersion: 1 },
        expect.any(Function),
      );
      expect(recordEvents).toHaveBeenCalledWith({
        events: [expect.any(ProductPublishedEvent)],
      });
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'active',
        version: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith({ productId: '12' }, 'Product published');
    });

    it('leaves an update out of the ledger', async () => {
      const { product } = (await write()) as { product: ProductModel };

      write.mockResolvedValue({
        product,
        events: [new ProductUpdatedEvent('12', { name: 'Desk lamp' }, { name: 'Lamp' })],
      });

      await useCase.execute({ productId: '12', expectedVersion: 1 });

      expect(recordEvents).toHaveBeenCalledWith({ events: [] });
    });

    it('invalidates the customer catalog after the write and before the ledger', async () => {
      await useCase.execute({ productId: '12', expectedVersion: undefined });

      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(write.mock.invocationCallOrder[0]).toBeLessThan(
        invalidate.mock.invocationCallOrder[0],
      );
      expect(invalidate.mock.invocationCallOrder[0]).toBeLessThan(
        recordEvents.mock.invocationCallOrder[0],
      );
    });

    it('invalidates nothing when the write fails', async () => {
      write.mockRejectedValue(new Error('PRODUCT_ALREADY_ARCHIVED'));

      await expect(
        useCase.execute({ productId: '12', expectedVersion: undefined }),
      ).rejects.toThrow('PRODUCT_ALREADY_ARCHIVED');
      expect(invalidate).not.toHaveBeenCalled();
      expect(recordEvents).not.toHaveBeenCalled();
    });

    it('hands the write service a change that publishes the product', async () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.DRAFT,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await useCase.execute({ productId: '12', expectedVersion: 1 });

      const [, mutate] = write.mock.calls[0] as [unknown, (product: ProductModel) => void];

      mutate(product);

      expect(product.status).toBe('active');
    });
  });
});
