import { PinoLogger } from 'nestjs-pino';

import { ItemStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ItemCreatedEvent, ItemModel } from '../../../domain';
import { ItemCreateUseCase } from '../item-create.use-case';

describe('ItemCreateUseCase', () => {
  let existsBySku: jest.Mock;
  let insert: jest.Mock;
  let claim: jest.Mock;
  let complete: jest.Mock;
  let release: jest.Mock;
  let publish: jest.Mock;
  let run: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ItemCreateUseCase;

  beforeEach(() => {
    existsBySku = jest.fn().mockResolvedValue(false);
    insert = jest.fn().mockResolvedValue(
      ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.DRAFT,
        version: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    );
    claim = jest.fn().mockResolvedValue({ outcome: 'claimed' });
    complete = jest.fn().mockResolvedValue(undefined);
    release = jest.fn().mockResolvedValue(undefined);
    publish = jest.fn().mockResolvedValue(undefined);
    run = jest.fn().mockImplementation((work: () => Promise<unknown>) => work());
    logger = makePinoLoggerMock();
    useCase = new ItemCreateUseCase(
      { existsBySku, insert },
      { claim, complete, release },
      { publish },
      { run },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('claims the key on the logical body, creates the item and completes the key in one transaction', async () => {
      const view = await useCase.execute({
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        idempotencyKey: 'key-1',
      });
      const [draft] = insert.mock.calls[0] as [ItemModel];

      expect(claim).toHaveBeenCalledWith({
        key: 'key-1',
        body: { sku: 'SKU-0001', name: 'Lamp', ownerId: 'owner-1' },
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

    it('publishes the creation under the stored id after the commit and logs it', async () => {
      await useCase.execute({
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        idempotencyKey: 'key-1',
      });

      expect(publish).toHaveBeenCalledWith({
        itemId: '12',
        events: [expect.any(ItemCreatedEvent)],
      });
      expect(run.mock.invocationCallOrder[0]).toBeLessThan(publish.mock.invocationCallOrder[0]);
      expect(logger.info).toHaveBeenCalledWith({ itemId: '12', sku: 'SKU-0001' }, 'Item created');
    });

    it('answers a replay with the stored response and does nothing else', async () => {
      claim.mockResolvedValue({
        outcome: 'replay',
        storedResponse: { id: '12', sku: 'SKU-0001' },
      });

      const view = await useCase.execute({
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        idempotencyKey: 'key-1',
      });

      expect(view).toEqual({ id: '12', sku: 'SKU-0001' });
      expect(insert).not.toHaveBeenCalled();
      expect(publish).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { idempotencyKey: 'key-1' },
        'Item creation replayed from the idempotency store',
      );
    });

    it.each([
      [
        'in-flight',
        'ITEM_IDEMPOTENT_REQUEST_IN_FLIGHT',
        'Idempotency-Key key-1 is still being processed, retry shortly',
      ],
      [
        'mismatch',
        'ITEM_IDEMPOTENCY_KEY_REUSED',
        'Idempotency-Key key-1 was already used with a different request body',
      ],
    ])('refuses an %s key with %s and keeps the key', async (outcome, code, message) => {
      claim.mockResolvedValue({ outcome });

      await expect(
        useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          ownerId: 'owner-1',
          idempotencyKey: 'key-1',
        }),
      ).rejects.toMatchObject({ code, message });
      expect(insert).not.toHaveBeenCalled();
      expect(release).not.toHaveBeenCalled();
    });

    it('refuses a taken sku with ITEM_SKU_TAKEN and releases the key', async () => {
      existsBySku.mockResolvedValue(true);

      await expect(
        useCase.execute({
          sku: 'SKU-0001',
          name: 'Lamp',
          ownerId: 'owner-1',
          idempotencyKey: 'key-1',
        }),
      ).rejects.toMatchObject({
        code: 'ITEM_SKU_TAKEN',
        message: 'Item sku SKU-0001 is already registered',
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
          ownerId: 'owner-1',
          idempotencyKey: 'key-1',
        }),
      ).rejects.toThrow('lock wait timeout');
      expect(release).toHaveBeenCalledWith({ key: 'key-1' });
      expect(publish).not.toHaveBeenCalled();
    });
  });
});
