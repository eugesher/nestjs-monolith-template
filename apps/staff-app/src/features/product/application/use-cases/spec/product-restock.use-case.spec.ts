import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductModel, ProductRestockedEvent } from '../../../domain';
import { ProductLedgerService } from '../../services/product-ledger.service';
import { ProductRestockUseCase } from '../product-restock.use-case';

describe('ProductRestockUseCase', () => {
  let lockById: jest.Mock;
  let insertStock: jest.Mock;
  let sumStock: jest.Mock;
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let enqueueRestocked: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductRestockUseCase;

  beforeEach(() => {
    lockById = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.DRAFT,
        version: 2,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    insertStock = jest.fn().mockResolvedValue('700');
    sumStock = jest.fn().mockResolvedValue(15);
    claim = jest.fn().mockResolvedValue({ outcome: 'claimed' });
    complete = jest.fn().mockResolvedValue(undefined);
    release = jest.fn().mockResolvedValue(undefined);
    enqueueRestocked = jest.fn().mockResolvedValue(undefined);
    run = jest.fn().mockImplementation((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();
    useCase = new ProductRestockUseCase(
      { enqueueRestocked } as unknown as ProductLedgerService,
      { lockById, insertStock, sumStock },
      { claim, complete, release },
      { run },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('claims the key, locks the product, writes the movement and completes the key in one transaction', async () => {
      const view = await useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' });

      expect(claim).toHaveBeenCalledWith({ key: 'key-1', body: { productId: '12', quantity: 5 } });
      expect(lockById).toHaveBeenCalledWith('12');
      expect(insertStock).toHaveBeenCalledWith({ productId: '12', quantity: 5 });
      expect(sumStock).toHaveBeenCalledWith('12');
      expect(view).toEqual({ productId: '12', quantity: 15 });
      expect(complete).toHaveBeenCalledWith({ key: 'key-1', response: view });
      expect(run).toHaveBeenCalledTimes(1);
      expect(release).not.toHaveBeenCalled();
    });

    it('enqueues the ledger record under the stock row after the commit and logs it', async () => {
      await useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' });

      expect(enqueueRestocked).toHaveBeenCalledWith({
        productId: '12',
        productStockId: '700',
        events: [expect.any(ProductRestockedEvent)],
      });
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(
        enqueueRestocked.mock.invocationCallOrder[0],
      );
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '12', quantity: 5, onHand: 15 },
        'Product restocked',
      );
    });

    it('answers a replay with the stored response and does nothing else', async () => {
      claim.mockResolvedValue({
        outcome: 'replay',
        storedResponse: { productId: '12', quantity: 10 },
      });

      const view = await useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' });

      expect(view).toEqual({ productId: '12', quantity: 10 });
      expect(lockById).not.toHaveBeenCalled();
      expect(enqueueRestocked).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { idempotencyKey: 'key-1' },
        'Product restock replayed from the idempotency store',
      );
    });

    it.each([
      [
        'in-flight',
        'PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT',
        'Idempotency-Key key-1 is still being processed, retry shortly',
      ],
      [
        'mismatch',
        'PRODUCT_IDEMPOTENCY_KEY_REUSED',
        'Idempotency-Key key-1 was already used with a different request body',
      ],
    ])('refuses an %s key with %s and keeps the key', async (outcome, code, message) => {
      claim.mockResolvedValue({ outcome });

      await expect(
        useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' }),
      ).rejects.toMatchObject({ code, message });
      expect(lockById).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it('refuses an unknown product with PRODUCT_NOT_FOUND and releases the key', async () => {
      lockById.mockResolvedValue(null);

      await expect(
        useCase.execute({ productId: '999', quantity: 5, idempotencyKey: 'key-1' }),
      ).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product 999 was not found',
      });
      expect(insertStock).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
    });

    it('refuses an archived product with PRODUCT_ALREADY_ARCHIVED and releases the key', async () => {
      lockById.mockResolvedValue(
        ProductModel.reconstitute({
          id: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ARCHIVED,
          version: 3,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      );

      await expect(
        useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' }),
      ).rejects.toMatchObject({ code: 'PRODUCT_ALREADY_ARCHIVED' });
      expect(insertStock).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
    });

    it('releases the key when the transaction fails and rethrows', async () => {
      complete.mockRejectedValue(new Error('lock wait timeout'));

      await expect(
        useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' }),
      ).rejects.toThrow('lock wait timeout');
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
      expect(enqueueRestocked).not.toHaveBeenCalled();
    });
  });
});
