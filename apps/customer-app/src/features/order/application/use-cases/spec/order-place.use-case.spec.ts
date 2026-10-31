import { PinoLogger } from 'nestjs-pino';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { OrderModel } from '../../../domain';
import { OrderLedgerService } from '../../services/order-ledger.service';
import { OrderPlaceUseCase } from '../order-place.use-case';

describe('OrderPlaceUseCase', () => {
  let findProducts: jest.Mock;
  let insert: jest.Mock;
  let lock: jest.Mock;
  let withdraw: jest.Mock;
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let recordPlaced: jest.Mock;
  let invalidate: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: OrderPlaceUseCase;

  beforeEach(() => {
    findProducts = jest.fn().mockResolvedValue([
      { productId: '100', sku: 'SKU-0001', name: 'Lamp', status: ProductStatusEnum.ACTIVE },
      { productId: '103', sku: 'SKU-0004', name: 'Chair', status: ProductStatusEnum.ACTIVE },
    ]);
    insert = jest.fn().mockResolvedValue(
      OrderModel.reconstitute({
        id: '610',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-05T08:00:00.000Z'),
        products: [
          { id: '620', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
          { id: '621', productId: '103', sku: 'SKU-0004', name: 'Chair' },
          { id: '622', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
        ],
      }),
    );
    lock = jest.fn().mockResolvedValue([
      { productId: '100', quantity: 8 },
      { productId: '103', quantity: 3 },
    ]);
    withdraw = jest.fn().mockResolvedValue(undefined);
    claim = jest.fn().mockResolvedValue({ outcome: 'claimed' });
    complete = jest.fn().mockResolvedValue(undefined);
    release = jest.fn().mockResolvedValue(undefined);
    recordPlaced = jest.fn().mockResolvedValue(undefined);
    invalidate = jest.fn().mockResolvedValue(undefined);
    run = jest.fn().mockImplementation((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();
    useCase = new OrderPlaceUseCase(
      { recordPlaced } as unknown as OrderLedgerService,
      { findProducts, insert },
      { lock, withdraw },
      { claim, complete, release },
      { invalidate },
      { run },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('claims the key, locks the distinct products, places the order, withdraws the stock and completes the key in one transaction', async () => {
      const view = await useCase.execute({
        customerId: 'customer-1',
        productIds: ['100', '103', '100'],
        idempotencyKey: 'key-1',
      });
      const [draft] = insert.mock.calls[0] as [OrderModel];

      expect(claim).toHaveBeenCalledWith({
        key: 'key-1',
        body: { customerId: 'customer-1', productIds: ['100', '103', '100'] },
      });
      expect(lock).toHaveBeenCalledWith({ productIds: ['100', '103'] });
      expect(findProducts).toHaveBeenCalledWith(['100', '103']);
      expect(lock.mock.invocationCallOrder[0]).toBeLessThan(
        findProducts.mock.invocationCallOrder[0],
      );
      expect(draft.id).toBeUndefined();
      expect(draft.customerId).toBe('customer-1');
      expect(draft.products.map((product) => product.productId)).toEqual(['100', '103', '100']);
      expect(view).toEqual({
        id: '610',
        createdAt: '2026-01-05T08:00:00.000Z',
        products: [
          { id: '620', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
          { id: '621', productId: '103', sku: 'SKU-0004', name: 'Chair' },
          { id: '622', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
        ],
      });
      expect(withdraw).toHaveBeenCalledWith({
        movements: [
          { productId: '100', orderProductId: '620' },
          { productId: '103', orderProductId: '621' },
          { productId: '100', orderProductId: '622' },
        ],
      });
      expect(complete).toHaveBeenCalledWith({ key: 'key-1', response: view });
      expect(run).toHaveBeenCalledTimes(1);
      expect(release).not.toHaveBeenCalled();
    });

    it('records the placed order in the ledger after the commit and logs it', async () => {
      await useCase.execute({
        customerId: 'customer-1',
        productIds: ['100', '103', '100'],
        idempotencyKey: 'key-1',
      });

      expect(recordPlaced).toHaveBeenCalledWith({
        orderId: '610',
        customerId: 'customer-1',
        productIds: ['100', '103', '100'],
      });
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(
        recordPlaced.mock.invocationCallOrder[0],
      );
      expect(logger.info).toHaveBeenCalledWith(
        { orderId: '610', customerId: 'customer-1', units: 3 },
        'Order placed',
      );
    });

    it('invalidates the cached catalog after the commit', async () => {
      await useCase.execute({
        customerId: 'customer-1',
        productIds: ['100', '103', '100'],
        idempotencyKey: 'key-1',
      });

      expect(invalidate).toHaveBeenCalledTimes(1);
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(invalidate.mock.invocationCallOrder[0]);
    });

    it('answers a replay with the stored response and does nothing else', async () => {
      claim.mockResolvedValue({ outcome: 'replay', storedResponse: { id: '610' } });

      const view = await useCase.execute({
        customerId: 'customer-1',
        productIds: ['100'],
        idempotencyKey: 'key-1',
      });

      expect(view).toEqual({ id: '610' });
      expect(lock).not.toHaveBeenCalled();
      expect(insert).not.toHaveBeenCalled();
      expect(recordPlaced).not.toHaveBeenCalled();
      expect(invalidate).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { idempotencyKey: 'key-1' },
        'Order placement replayed from the idempotency store',
      );
    });

    it.each([
      [
        'in-flight',
        'ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT',
        'Idempotency-Key key-1 is still being processed, retry shortly',
      ],
      [
        'mismatch',
        'ORDER_IDEMPOTENCY_KEY_REUSED',
        'Idempotency-Key key-1 was already used with a different request body',
      ],
    ])('refuses an %s key with %s and keeps the key', async (outcome, code, message) => {
      claim.mockResolvedValue({ outcome });

      await expect(
        useCase.execute({
          customerId: 'customer-1',
          productIds: ['100'],
          idempotencyKey: 'key-1',
        }),
      ).rejects.toMatchObject({ code, message });
      expect(lock).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it('refuses more units than in stock inside the transaction, writes nothing and releases the key', async () => {
      await expect(
        useCase.execute({
          customerId: 'customer-1',
          productIds: ['103', '103', '103', '103'],
          idempotencyKey: 'key-1',
        }),
      ).rejects.toMatchObject({
        code: 'ORDER_STOCK_INSUFFICIENT',
        message: 'Product 103 has 3 in stock, 4 requested',
      });
      expect(run).toHaveBeenCalledTimes(1);
      expect(insert).not.toHaveBeenCalled();
      expect(withdraw).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
      expect(recordPlaced).not.toHaveBeenCalled();
      expect(invalidate).not.toHaveBeenCalled();
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
    });

    it('releases the key when the transaction fails and rethrows', async () => {
      complete.mockRejectedValue(new Error('lock wait timeout'));

      await expect(
        useCase.execute({
          customerId: 'customer-1',
          productIds: ['100'],
          idempotencyKey: 'key-1',
        }),
      ).rejects.toThrow('lock wait timeout');
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
      expect(recordPlaced).not.toHaveBeenCalled();
    });
  });
});
