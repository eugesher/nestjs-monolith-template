import { ItemStatusEnum } from '@acme-libs/kernel';
import {
  LedgerCatalogEventsRecordItemArchivedUseCase,
  LedgerCatalogEventsRecordItemCreatedUseCase,
} from '../../application';
import { LedgerCatalogEventsConsumer } from '../ledger-catalog-events.consumer';

describe('LedgerCatalogEventsConsumer', () => {
  let recordItemCreated: jest.Mock;
  let recordItemArchived: jest.Mock;
  let consumer: LedgerCatalogEventsConsumer;

  beforeEach(() => {
    recordItemCreated = jest.fn().mockResolvedValue(undefined);
    recordItemArchived = jest.fn().mockResolvedValue(undefined);
    consumer = new LedgerCatalogEventsConsumer(
      { execute: recordItemCreated } as unknown as LedgerCatalogEventsRecordItemCreatedUseCase,
      { execute: recordItemArchived } as unknown as LedgerCatalogEventsRecordItemArchivedUseCase,
    );
  });

  describe('handleItemCreated', () => {
    it('records the created item', async () => {
      await consumer.handleItemCreated({
        itemId: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(recordItemCreated).toHaveBeenCalledWith({
        itemId: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(recordItemArchived).not.toHaveBeenCalled();
    });
  });

  describe('handleItemArchived', () => {
    it('records the archived item', async () => {
      await consumer.handleItemArchived({
        itemId: '12',
        sku: 'SKU-0001',
        previousStatus: ItemStatusEnum.ACTIVE,
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(recordItemArchived).toHaveBeenCalledWith({
        itemId: '12',
        sku: 'SKU-0001',
        previousStatus: 'active',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(recordItemCreated).not.toHaveBeenCalled();
    });
  });
});
