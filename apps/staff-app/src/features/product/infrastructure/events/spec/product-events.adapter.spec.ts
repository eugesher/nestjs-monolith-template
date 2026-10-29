import { ProductStatusEnum } from '@acme-libs/kernel';
import { ProductArchivedEvent, ProductCreatedEvent, ProductRenamedEvent } from '../../../domain';
import { ProductEventsAdapter } from '../product-events.adapter';

describe('ProductEventsAdapter', () => {
  let publish: jest.Mock;
  let adapter: ProductEventsAdapter;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-01T00:00:00.000Z') });
    publish = jest.fn().mockResolvedValue(undefined);
    adapter = new ProductEventsAdapter({ publish });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('publish', () => {
    it('publishes a creation under the stored id, not the id of the draft', async () => {
      await adapter.publish({
        productId: '12',
        events: [new ProductCreatedEvent(undefined, 'SKU-0001', 'Reference product')],
      });

      expect(publish).toHaveBeenCalledWith('catalog.product.created', {
        productId: '12',
        sku: 'SKU-0001',
        name: 'Reference product',
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('publishes a rename with the previous name', async () => {
      await adapter.publish({
        productId: '12',
        events: [new ProductRenamedEvent('12', 'New name', 'Old name')],
      });

      expect(publish).toHaveBeenCalledWith('catalog.product.renamed', {
        productId: '12',
        name: 'New name',
        previousName: 'Old name',
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('publishes an archive with the sku and the previous status', async () => {
      await adapter.publish({
        productId: '12',
        events: [new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE)],
      });

      expect(publish).toHaveBeenCalledWith('catalog.product.archived', {
        productId: '12',
        sku: 'SKU-0001',
        previousStatus: ProductStatusEnum.ACTIVE,
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('publishes the events in order, one after another', async () => {
      await adapter.publish({
        productId: '12',
        events: [
          new ProductRenamedEvent('12', 'New name', 'Old name'),
          new ProductArchivedEvent('12', 'SKU-0001', ProductStatusEnum.ACTIVE),
        ],
      });

      expect(publish.mock.calls.map(([name]) => name as string)).toEqual([
        'catalog.product.renamed',
        'catalog.product.archived',
      ]);
    });

    it('publishes nothing for no events', async () => {
      await adapter.publish({ productId: '12', events: [] });

      expect(publish).not.toHaveBeenCalled();
    });

    it('refuses an event that has no catalog name', async () => {
      const publishing = adapter.publish({
        productId: '12',
        events: [
          {
            id: 'event-1',
            aggregateId: '12',
            occurredAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
      });

      await expect(publishing).rejects.toThrow('Product event Object has no catalog event name');
      expect(publish).not.toHaveBeenCalled();
    });
  });
});
