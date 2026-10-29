import { ItemStatusEnum } from '@acme-libs/kernel';
import { ItemArchivedEvent, ItemCreatedEvent, ItemRenamedEvent } from '../../../domain';
import { ItemEventsAdapter } from '../item-events.adapter';

describe('ItemEventsAdapter', () => {
  let publish: jest.Mock;
  let adapter: ItemEventsAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-01T00:00:00.000Z') });
    publish = jest.fn().mockResolvedValue(undefined);
    adapter = new ItemEventsAdapter({ publish });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('publish', () => {
    it('publishes a creation under the stored id, not the id of the draft', async () => {
      await adapter.publish({
        itemId: '12',
        events: [
          new ItemCreatedEvent(
            undefined,
            'SKU-0001',
            'Reference item',
            '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
          ),
        ],
      });

      expect(publish).toHaveBeenCalledWith('catalog.item.created', {
        itemId: '12',
        sku: 'SKU-0001',
        name: 'Reference item',
        ownerId: '7d3f0e2a-5b1c-4c8e-9a4f-2b6d8e1f3a5c',
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('publishes a rename with the previous name', async () => {
      await adapter.publish({
        itemId: '12',
        events: [new ItemRenamedEvent('12', 'New name', 'Old name')],
      });

      expect(publish).toHaveBeenCalledWith('catalog.item.renamed', {
        itemId: '12',
        name: 'New name',
        previousName: 'Old name',
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('publishes an archive with the sku and the previous status', async () => {
      await adapter.publish({
        itemId: '12',
        events: [new ItemArchivedEvent('12', 'SKU-0001', ItemStatusEnum.ACTIVE)],
      });

      expect(publish).toHaveBeenCalledWith('catalog.item.archived', {
        itemId: '12',
        sku: 'SKU-0001',
        previousStatus: ItemStatusEnum.ACTIVE,
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('publishes the events in order, one after another', async () => {
      await adapter.publish({
        itemId: '12',
        events: [
          new ItemRenamedEvent('12', 'New name', 'Old name'),
          new ItemArchivedEvent('12', 'SKU-0001', ItemStatusEnum.ACTIVE),
        ],
      });

      expect(publish.mock.calls.map(([name]) => name as string)).toEqual([
        'catalog.item.renamed',
        'catalog.item.archived',
      ]);
    });

    it('publishes nothing for no events', async () => {
      await adapter.publish({ itemId: '12', events: [] });

      expect(publish).not.toHaveBeenCalled();
    });

    it('refuses an event that has no catalog name', async () => {
      const publishing = adapter.publish({
        itemId: '12',
        events: [
          {
            id: 'event-1',
            aggregateId: '12',
            occurredAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
      });

      await expect(publishing).rejects.toThrow('Item event Object has no catalog event name');
      expect(publish).not.toHaveBeenCalled();
    });
  });
});
