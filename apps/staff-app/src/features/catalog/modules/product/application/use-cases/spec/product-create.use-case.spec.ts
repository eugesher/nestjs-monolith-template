import type { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { ProductCreateInsertOutcomeEnum } from '../../../outbound';
import { ProductCreateUseCase } from '../product-create.use-case';
import type { IProductLedgerPort } from '../../../outbound';

describe('ProductCreateUseCase', () => {
  let existsBySku: jest.Mock;
  let insert: jest.Mock;
  let findInserted: jest.Mock;
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let recordCreated: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ProductCreateUseCase;

  beforeEach(() => {
    existsBySku = jest.fn().mockResolvedValue(false);
    insert = jest
      .fn()
      .mockResolvedValue({ outcome: ProductCreateInsertOutcomeEnum.INSERTED, id: '12' });
    findInserted = jest.fn().mockResolvedValue({
      id: '12',
      sku: 'SKU-0001',
      name: 'Lamp',
      status: ProductStatusEnum.DRAFT,
      version: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    claim = jest.fn().mockResolvedValue({ outcome: 'claimed' });
    complete = jest.fn().mockResolvedValue(undefined);
    release = jest.fn().mockResolvedValue(undefined);
    recordCreated = jest.fn().mockResolvedValue(undefined);
    run = jest.fn().mockImplementation((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();
    useCase = new ProductCreateUseCase(
      { existsBySku, insert, findInserted },
      { claim, complete, release },
      { recordCreated } as unknown as IProductLedgerPort,
      { run },
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('execute', () => {
    it(
      'claims the key on the logical body, ' +
        'creates the product and completes the key in one transaction',
      async () => {
        const view = await useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          idempotencyKey: 'key-1',
        });

        expect(claim).toHaveBeenCalledWith({
          key: 'key-1',
          body: { sku: 'SKU-0001', name: 'Lamp' },
        });
        expect(existsBySku).toHaveBeenCalledWith('SKU-0001');
        expect(insert).toHaveBeenCalledWith({
          sku: 'SKU-0001',
          name: 'Lamp',
          status: 'draft',
          version: 1,
        });
        expect(findInserted).toHaveBeenCalledWith('12');
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
      },
    );

    it(
      'enqueues the creation record under the ' + 'stored id after the commit and logs it',
      async () => {
        await useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          idempotencyKey: 'key-1',
        });

        expect(recordCreated).toHaveBeenCalledWith({
          productId: '12',
          sku: 'SKU-0001',
          name: 'Lamp',
        });
        expect(run.mock.invocationCallOrder[0]).toBeLessThan(
          recordCreated.mock.invocationCallOrder[0],
        );
        expect(logger.info).toHaveBeenCalledWith(
          { productId: '12', sku: 'SKU-0001' },
          'Product created',
        );
      },
    );

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
      expect(recordCreated).not.toHaveBeenCalled();
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

    it(
      'refuses a sku taken by a concurrent insert ' + 'with PRODUCT_SKU_TAKEN and releases the key',
      async () => {
        insert.mockResolvedValue({ outcome: ProductCreateInsertOutcomeEnum.DUPLICATE });

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
        expect(findInserted).not.toHaveBeenCalled();
        expect(release).toHaveBeenCalledWith({ key: 'key-1' });
      },
    );

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
      expect(recordCreated).not.toHaveBeenCalled();
    });
  });
});
