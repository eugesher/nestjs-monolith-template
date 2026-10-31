import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductModel, ProductPublishedEvent } from '../../../domain';
import { ProductLedgerService } from '../../services/product-ledger.service';
import { ProductWriteService } from '../../services/product-write.service';
import { ProductPublishUseCase } from '../product-publish.use-case';

describe('ProductPublishUseCase', () => {
  let write: jest.Mock;
  let enqueue: jest.Mock;
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
    enqueue = jest.fn().mockResolvedValue(undefined);
    invalidate = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ProductPublishUseCase(
      { write } as unknown as ProductWriteService,
      { enqueue } as unknown as ProductLedgerService,
      { invalidate },
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
      expect(enqueue).toHaveBeenCalledWith({
        productId: '12',
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

    it('invalidates the customer catalog after the write and before the ledger', async () => {
      await useCase.execute({ productId: '12', expectedVersion: undefined });

      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(write.mock.invocationCallOrder[0]).toBeLessThan(
        invalidate.mock.invocationCallOrder[0],
      );
      expect(invalidate.mock.invocationCallOrder[0]).toBeLessThan(
        enqueue.mock.invocationCallOrder[0],
      );
    });

    it('invalidates nothing when the write fails', async () => {
      write.mockRejectedValue(new Error('PRODUCT_ALREADY_ARCHIVED'));

      await expect(
        useCase.execute({ productId: '12', expectedVersion: undefined }),
      ).rejects.toThrow('PRODUCT_ALREADY_ARCHIVED');
      expect(invalidate).not.toHaveBeenCalled();
      expect(enqueue).not.toHaveBeenCalled();
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
