import { ProductStatusEnum } from '@acme-libs/kernel';
import {
  LedgerCatalogEventsRecordProductArchivedUseCase,
  LedgerCatalogEventsRecordProductCreatedUseCase,
} from '../../application';
import { LedgerCatalogEventsConsumer } from '../ledger-catalog-events.consumer';

describe('LedgerCatalogEventsConsumer', () => {
  let recordProductCreated: jest.Mock;
  let recordProductArchived: jest.Mock;
  let consumer: LedgerCatalogEventsConsumer;

  beforeEach(() => {
    recordProductCreated = jest.fn().mockResolvedValue(undefined);
    recordProductArchived = jest.fn().mockResolvedValue(undefined);
    consumer = new LedgerCatalogEventsConsumer(
      {
        execute: recordProductCreated,
      } as unknown as LedgerCatalogEventsRecordProductCreatedUseCase,
      {
        execute: recordProductArchived,
      } as unknown as LedgerCatalogEventsRecordProductArchivedUseCase,
    );
  });

  describe('handleProductCreated', () => {
    it('records the created product', async () => {
      await consumer.handleProductCreated({
        productId: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(recordProductCreated).toHaveBeenCalledWith({
        productId: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(recordProductArchived).not.toHaveBeenCalled();
    });
  });

  describe('handleProductArchived', () => {
    it('records the archived product', async () => {
      await consumer.handleProductArchived({
        productId: '12',
        sku: 'SKU-0001',
        previousStatus: ProductStatusEnum.ACTIVE,
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(recordProductArchived).toHaveBeenCalledWith({
        productId: '12',
        sku: 'SKU-0001',
        previousStatus: 'active',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(recordProductCreated).not.toHaveBeenCalled();
    });
  });
});
