import { LedgerCatalogEventsRecordService } from '../../services/ledger-catalog-events-record.service';
import { LedgerCatalogEventsRecordItemCreatedUseCase } from '../ledger-catalog-events-record-item-created.use-case';

describe('LedgerCatalogEventsRecordItemCreatedUseCase', () => {
  describe('execute', () => {
    it('records the creation under the operation key of the item', async () => {
      const record = jest.fn().mockResolvedValue(undefined);
      const useCase = new LedgerCatalogEventsRecordItemCreatedUseCase({
        record,
      } as unknown as LedgerCatalogEventsRecordService);

      await useCase.execute({
        itemId: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        ownerId: 'owner-1',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(record).toHaveBeenCalledWith({
        operationKey: 'item-created:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemCreated',
        payload: { sku: 'SKU-0001', name: 'Lamp', ownerId: 'owner-1' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });
});
