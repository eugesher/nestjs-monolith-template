import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductArchivedEvent, ProductModel } from '../../../domain';
import { ProductLedgerService } from '../../services/product-ledger.service';
import { ProductWriteService } from '../../services/product-write.service';
import { ProductArchiveUseCase } from '../product-archive.use-case';

describe('ProductArchiveUseCase', () => {
  let write: jest.Mock;
  let recordArchived: jest.Mock;
  let publish: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductArchiveUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue({
      product: ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ARCHIVED,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      events: [new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE)],
    });
    recordArchived = jest.fn().mockResolvedValue(undefined);
    publish = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ProductArchiveUseCase(
      { write } as unknown as ProductWriteService,
      { recordArchived } as unknown as ProductLedgerService,
      { publish },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('archives, publishes the events, records the archive in the ledger and answers the stored product', async () => {
      const view = await useCase.execute({
        productId: '12',
        expectedVersion: undefined,
      });

      expect(write).toHaveBeenCalledWith(
        { productId: '12', expectedVersion: undefined },
        expect.any(Function),
      );
      expect(publish).toHaveBeenCalledWith({
        productId: '12',
        events: [expect.any(ProductArchivedEvent)],
      });
      expect(recordArchived).toHaveBeenCalledWith({
        productId: '12',
        events: [expect.any(ProductArchivedEvent)],
      });
      expect(publish.mock.invocationCallOrder[0]).toBeLessThan(
        recordArchived.mock.invocationCallOrder[0],
      );
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'archived',
        version: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith({ productId: '12' }, 'Product archived');
    });

    it('hands the write service a change that archives the product', async () => {
      const product = ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await useCase.execute({ productId: '12', expectedVersion: 3 });

      const [, mutate] = write.mock.calls[0] as [unknown, (product: ProductModel) => void];

      mutate(product);

      expect(product.status).toBe('archived');
    });
  });
});
