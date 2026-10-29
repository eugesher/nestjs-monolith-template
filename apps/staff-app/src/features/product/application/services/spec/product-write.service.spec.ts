import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductModel, ProductRenamedEvent } from '../../../domain';
import { ProductAccessService } from '../product-access.service';
import { ProductWriteService } from '../product-write.service';

describe('ProductWriteService', () => {
  let load: jest.Mock;
  let findById: jest.Mock;
  let update: jest.Mock;
  let logger: PinoLoggerMock;
  let service: ProductWriteService;

  beforeEach(() => {
    load = jest.fn().mockImplementation(() =>
      Promise.resolve(
        ProductModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          version: 3,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ),
    );
    findById = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Desk lamp',
        status: ProductStatusEnum.ACTIVE,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
    );
    update = jest.fn().mockResolvedValue(true);
    logger = makePinoLoggerMock();
    service = new ProductWriteService(
      { load } as unknown as ProductAccessService,
      { findById, update },
      5,
      logger as unknown as PinoLogger,
    );
  });

  describe('write', () => {
    it('saves the change against the version as read and answers the stored product with the events', async () => {
      const written = await service.write(
        { productId: '12', expectedVersion: undefined },
        (product) => product.rename('Desk lamp'),
      );
      const [command] = update.mock.calls[0] as [{ product: ProductModel; versionAsRead: number }];

      expect(load).toHaveBeenCalledWith({ productId: '12' });
      expect(command.versionAsRead).toBe(3);
      expect(command.product.name).toBe('Desk lamp');
      expect(command.product.version).toBe(4);
      expect(findById).toHaveBeenCalledWith('12');
      expect(written.product.updatedAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
      expect(written.events).toHaveLength(1);
      expect(written.events[0]).toBeInstanceOf(ProductRenamedEvent);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('writes nothing when the change leaves the version as read', async () => {
      const written = await service.write({ productId: '12', expectedVersion: 3 }, (product) =>
        product.rename('Lamp'),
      );

      expect(update).not.toHaveBeenCalled();
      expect(findById).not.toHaveBeenCalled();
      expect(written.product.version).toBe(3);
      expect(written.events).toEqual([]);
    });

    it('retries a lost race with a fresh read and logs the retry', async () => {
      update.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      const written = await service.write(
        { productId: '12', expectedVersion: undefined },
        (product) => product.rename('Desk lamp'),
      );

      expect(load).toHaveBeenCalledTimes(2);
      expect(update).toHaveBeenCalledTimes(2);
      expect(written.product.version).toBe(4);
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '12', currentVersion: 4, attempt: 1, maxAttempts: 5 },
        'Product write conflict — retrying with a fresh read',
      );
    });

    it('refuses with VERSION_MISMATCH once the budget is spent and logs a warning', async () => {
      update.mockResolvedValue(false);

      await expect(
        service.write({ productId: '12', expectedVersion: undefined }, (product) =>
          product.rename('Desk lamp'),
        ),
      ).rejects.toMatchObject({
        code: 'VERSION_MISMATCH',
        message: 'Product 12 write lost the optimistic race after 5 attempts',
        details: { currentVersion: 4 },
      });
      expect(update).toHaveBeenCalledTimes(5);
      expect(logger.warn).toHaveBeenCalledWith(
        { productId: '12', attempts: 5, maxAttempts: 5 },
        'Product write conflict exhausted retry budget',
      );
    });

    it('makes one attempt when the caller pinned a version', async () => {
      update.mockResolvedValue(false);

      await expect(
        service.write({ productId: '12', expectedVersion: 3 }, (product) =>
          product.rename('Desk lamp'),
        ),
      ).rejects.toMatchObject({
        code: 'VERSION_MISMATCH',
        message: 'Product 12 write lost the optimistic race after 1 attempts',
      });
      expect(update).toHaveBeenCalledTimes(1);
    });

    it('refuses a pinned version that is not the current one before changing anything', async () => {
      const mutate = jest.fn();

      await expect(
        service.write({ productId: '12', expectedVersion: 2 }, mutate),
      ).rejects.toMatchObject({ code: 'VERSION_MISMATCH', details: { currentVersion: 3 } });
      expect(mutate).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it('does not retry a domain refusal', async () => {
      await expect(
        service.write({ productId: '12', expectedVersion: undefined }, (product) =>
          product.rename(' '),
        ),
      ).rejects.toMatchObject({ code: 'PRODUCT_NAME_INVALID' });
      expect(load).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['after a lost race', false],
      ['after a saved change', true],
    ])('refuses with PRODUCT_NOT_FOUND when the product vanished %s', async (_, updated) => {
      update.mockResolvedValue(updated);
      findById.mockResolvedValue(null);

      await expect(
        service.write({ productId: '12', expectedVersion: undefined }, (product) =>
          product.rename('Desk lamp'),
        ),
      ).rejects.toMatchObject({ code: 'PRODUCT_NOT_FOUND', message: 'Product 12 was not found' });
    });
  });
});
