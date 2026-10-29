import { ProductStatusEnum } from '@acme-libs/kernel';
import { LedgerCatalogEventsRecordService } from '../../services/ledger-catalog-events-record.service';
import { LedgerCatalogEventsRecordProductArchivedUseCase } from '../ledger-catalog-events-record-product-archived.use-case';

describe('LedgerCatalogEventsRecordProductArchivedUseCase', () => {
  describe('execute', () => {
    it('records the archive under the key and with the payload the product feature uses', async () => {
      const record = jest.fn().mockResolvedValue(undefined);
      const useCase = new LedgerCatalogEventsRecordProductArchivedUseCase({
        record,
      } as unknown as LedgerCatalogEventsRecordService);

      await useCase.execute({
        productId: '12',
        sku: 'SKU-0001',
        previousStatus: ProductStatusEnum.ACTIVE,
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(record).toHaveBeenCalledWith({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });
});
