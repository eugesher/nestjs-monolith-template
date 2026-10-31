import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ProductCreatedEvent, ProductModel } from '../../../domain';
import { ProductLedgerService } from '../../services/product-ledger.service';
import { ProductCreateUseCase } from '../product-create.use-case';

describe('ProductCreateUseCase', () => {
  let existsBySku: jest.Mock;
  let insert: jest.Mock;
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let enqueue: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductCreateUseCase;

  beforeEach(() => {
    existsBySku = jest.fn().mockResolvedValue(false);
    insert = jest.fn().mockResolvedValue(
      ProductModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: ProductStatusEnum.DRAFT,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    claim = jest.fn().mockResolvedValue({ outcome: 'claimed' });
    complete = jest.fn().mockResolvedValue(undefined);
    release = jest.fn().mockResolvedValue(undefined);
    enqueue = jest.fn().mockResolvedValue(undefined);
    run = jest.fn().mockImplementation((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();
    useCase = new ProductCreateUseCase(
      { enqueue } as unknown as ProductLedgerService,
      { existsBySku, insert },
      { claim, complete, release },
      { run, afterCommit: jest.fn() },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('claims the key on the logical body, creates the product and completes the key in one transaction', async () => {
      const view = await useCase.execute({
        sku: 'SKU-0001',
        name: 'Lamp',
        idempotencyKey: 'key-1',
      });
      const [draft] = insert.mock.calls[0] as [ProductModel];

      expect(claim).toHaveBeenCalledWith({
        key: 'key-1',
        body: { sku: 'SKU-0001', name: 'Lamp' },
      });
      expect(existsBySku).toHaveBeenCalledWith('SKU-0001');
      expect(draft.id).toBeUndefined();
      expect(draft.status).toBe('draft');
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        status: 'draft',
        version: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      });
      expect(complete).toHaveBeenCalledWith({ key: 'key-1', response: view });
      expect(run).toHaveBeenCalledTimes(1);
      expect(release).not.toHaveBeenCalled();
    });

    it('enqueues the ledger records under the stored id after the commit and logs it', async () => {
      await useCase.execute({
        sku: 'SKU-0001',
        name: 'Lamp',
        idempotencyKey: 'key-1',
      });

      expect(enqueue).toHaveBeenCalledWith({
        productId: '12',
        events: [expect.any(ProductCreatedEvent)],
      });
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(enqueue.mock.invocationCallOrder[0]);
      expect(logger.info).toHaveBeenCalledWith(
        { productId: '12', sku: 'SKU-0001' },
        'Product created',
      );
    });

    it('answers a replay with the stored response and does nothing else', async () => {
      claim.mockResolvedValue({
        outcome: 'replay',
        storedResponse: { id: '12', sku: 'SKU-0001' },
      });

      const view = await useCase.execute({
        sku: 'SKU-0001',
        name: 'Lamp',
        idempotencyKey: 'key-1',
      });

      expect(view).toEqual({ id: '12', sku: 'SKU-0001' });
      expect(insert).not.toHaveBeenCalled();
      expect(enqueue).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { idempotencyKey: 'key-1' },
        'Product creation replayed from the idempotency store',
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
        useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          idempotencyKey: 'key-1',
        }),
      ).rejects.toMatchObject({ code, message });
      expect(insert).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it('refuses a taken sku with PRODUCT_SKU_TAKEN and releases the key', async () => {
      existsBySku.mockResolvedValue(true);

      await expect(
        useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          idempotencyKey: 'key-1',
        }),
      ).rejects.toMatchObject({
        code: 'PRODUCT_SKU_TAKEN',
        message: 'Product sku SKU-0001 is already registered',
      });
      expect(insert).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
    });

    it('releases the key when the transaction fails and rethrows', async () => {
      complete.mockRejectedValue(new Error('lock wait timeout'));

      await expect(
        useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          idempotencyKey: 'key-1',
        }),
      ).rejects.toThrow('lock wait timeout');
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
      expect(enqueue).not.toHaveBeenCalled();
    });
  });
});
