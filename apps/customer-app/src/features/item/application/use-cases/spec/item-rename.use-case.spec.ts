import { PinoLogger } from 'nestjs-pino';

import { ItemStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ItemModel, ItemRenamedEvent } from '../../../domain';
import { ItemWriteService } from '../../services/item-write.service';
import { ItemRenameUseCase } from '../item-rename.use-case';

describe('ItemRenameUseCase', () => {
  let write: jest.Mock;
  let publish: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ItemRenameUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue({
      item: ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Desk lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      events: [new ItemRenamedEvent('12', 'Desk lamp', 'Lamp')],
    });
    publish = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ItemRenameUseCase(
      { write } as unknown as ItemWriteService,
      { publish },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('renames through the write service, publishes the events and answers the stored item', async () => {
      const view = await useCase.execute({
        itemId: '12',
        name: 'Desk lamp',
        ownerId: 'owner-1',
        expectedVersion: 3,
      });

      expect(write).toHaveBeenCalledWith(
        { itemId: '12', ownerId: 'owner-1', expectedVersion: 3 },
        expect.any(Function),
      );
      expect(publish).toHaveBeenCalledWith({
        itemId: '12',
        events: [expect.any(ItemRenamedEvent)],
      });
      expect(view).toEqual({
        id: '12',
        sku: 'SKU-0001',
        name: 'Desk lamp',
        status: 'active',
        version: 4,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      });
      expect(logger.info).toHaveBeenCalledWith({ itemId: '12', version: 4 }, 'Item renamed');
    });

    it('hands the write service a change that renames the item', async () => {
      const item = ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ACTIVE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      await useCase.execute({
        itemId: '12',
        name: 'Desk lamp',
        ownerId: 'owner-1',
        expectedVersion: undefined,
      });

      const [, mutate] = write.mock.calls[0] as [unknown, (item: ItemModel) => void];

      mutate(item);

      expect(item.name).toBe('Desk lamp');
    });
  });
});
