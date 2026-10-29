import { ItemStatusEnum } from '@acme-libs/kernel';
import { LedgerCatalogEventsRecordService } from '../../services/ledger-catalog-events-record.service';
import { LedgerCatalogEventsRecordItemArchivedUseCase } from '../ledger-catalog-events-record-item-archived.use-case';

describe('LedgerCatalogEventsRecordItemArchivedUseCase', () => {
  describe('execute', () => {
    it('records the archive under the key and with the payload the item feature uses', async () => {
      const record = jest.fn().mockResolvedValue(undefined);
      const useCase = new LedgerCatalogEventsRecordItemArchivedUseCase({
        record,
      } as unknown as LedgerCatalogEventsRecordService);

      await useCase.execute({
        itemId: '12',
        sku: 'SKU-0001',
        previousStatus: ItemStatusEnum.ACTIVE,
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(record).toHaveBeenCalledWith({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });
});
