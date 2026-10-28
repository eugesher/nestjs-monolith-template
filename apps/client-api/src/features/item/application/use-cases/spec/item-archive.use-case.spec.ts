import { PinoLogger } from 'nestjs-pino';

import { ItemStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { ItemArchivedEvent, ItemModel } from '../../../domain';
import { ItemLedgerService } from '../../services/item-ledger.service';
import { ItemWriteService } from '../../services/item-write.service';
import { ItemArchiveUseCase } from '../item-archive.use-case';

describe('ItemArchiveUseCase', () => {
  let write: jest.Mock;
  let recordArchived: jest.Mock;
  let publish: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: ItemArchiveUseCase;

  beforeEach(() => {
    write = jest.fn().mockResolvedValue({
      item: ItemModel.reconstitute({
        id: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        status: ItemStatusEnum.ARCHIVED,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z'),
      }),
      events: [new ItemArchivedEvent('12', ItemStatusEnum.ACTIVE)],
    });
    recordArchived = jest.fn().mockResolvedValue(undefined);
    publish = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new ItemArchiveUseCase(
      { write } as unknown as ItemWriteService,
      { recordArchived } as unknown as ItemLedgerService,
      { publish },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('archives, publishes the events, records the archive in the ledger and answers the stored item', async () => {
      const view = await useCase.execute({
        itemId: '12',
        ownerId: 'owner-1',
        expectedVersion: undefined,
      });

      expect(write).toHaveBeenCalledWith(
        { itemId: '12', ownerId: 'owner-1', expectedVersion: undefined },
        expect.any(Function),
      );
      expect(publish).toHaveBeenCalledWith({
        itemId: '12',
        events: [expect.any(ItemArchivedEvent)],
      });
      expect(recordArchived).toHaveBeenCalledWith({
        itemId: '12',
        sku: 'SKU-0001',
        events: [expect.any(ItemArchivedEvent)],
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
      expect(logger.info).toHaveBeenCalledWith({ itemId: '12' }, 'Item archived');
    });

    it('hands the write service a change that archives the item', async () => {
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

      await useCase.execute({ itemId: '12', ownerId: 'owner-1', expectedVersion: 3 });

      const [, mutate] = write.mock.calls[0] as [unknown, (item: ItemModel) => void];

      mutate(item);

      expect(item.status).toBe('archived');
    });
  });
});
