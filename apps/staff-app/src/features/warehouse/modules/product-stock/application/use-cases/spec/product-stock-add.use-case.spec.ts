import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { ProductStockAddedEvent } from '../../../domain';
import { ProductStockAddUseCase } from '../product-stock-add.use-case';

describe('ProductStockAddUseCase', () => {
  let findById: jest.Mock;
  let lock: jest.Mock;
  let add: jest.Mock;
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let recordEvents: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductStockAddUseCase;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({ id: '12', sku: 'SKU-0001' });
    lock = jest.fn().mockResolvedValue(undefined);
    add = jest.fn().mockResolvedValue({ productStockId: '700', quantity: 15 });
    claim = jest.fn().mockResolvedValue({ outcome: 'claimed' });
    complete = jest.fn().mockResolvedValue(undefined);
    release = jest.fn().mockResolvedValue(undefined);
    recordEvents = jest.fn().mockResolvedValue(undefined);
    run = jest.fn().mockImplementation((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();
    useCase = new ProductStockAddUseCase(
      { findById },
      { lock, add },
      { claim, complete, release },
      { recordEvents },
      { run },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('claims the key, locks the product, writes the movement and completes the key in one transaction', async () => {
      const view = await useCase.execute({
        productId: '12',
        quantity: 5,
        idempotencyKey: 'key-1',
      });

      expect(claim).toHaveBeenCalledWith({
        key: 'key-1',
        body: { productId: '12', quantity: 5 },
      });
      expect(lock).toHaveBeenCalledWith({ productId: '12' });
      expect(findById).toHaveBeenCalledWith('12');
      expect(lock.mock.invocationCallOrder[0]).toBeLessThan(findById.mock.invocationCallOrder[0]);
      expect(add).toHaveBeenCalledWith({ productId: '12', quantity: 5 });
      expect(view).toEqual({ productId: '12', quantity: 15 });
      expect(complete).toHaveBeenCalledWith({ key: 'key-1', response: view });
      expect(run).toHaveBeenCalledTimes(1);
      expect(release).not.toHaveBeenCalled();
    });

    it('enqueues the ledger record under the stock row after the commit and logs it', async () => {
      await useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' });

      expect(recordEvents).toHaveBeenCalledWith({
        productStockId: '700',
        events: [expect.any(ProductStockAddedEvent)],
      });
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(
        recordEvents.mock.invocationCallOrder[0],
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
      expect(lock).not.toHaveBeenCalled();
      expect(recordEvents).not.toHaveBeenCalled();
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
      expect(lock).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it('refuses an unknown product with PRODUCT_NOT_FOUND and releases the key', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ productId: '999', quantity: 5, idempotencyKey: 'key-1' }),
      ).rejects.toMatchObject({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product 999 was not found',
      });
      expect(add).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
    });

    it('releases the key when the transaction fails and rethrows', async () => {
      complete.mockRejectedValue(new Error('lock wait timeout'));

      await expect(
        useCase.execute({ productId: '12', quantity: 5, idempotencyKey: 'key-1' }),
      ).rejects.toThrow('lock wait timeout');
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
      expect(recordEvents).not.toHaveBeenCalled();
    });
  });
});
