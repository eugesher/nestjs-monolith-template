import { LedgerCatalogEventsRecordService } from '../../services/ledger-catalog-events-record.service';
import { LedgerCatalogEventsRecordProductCreatedUseCase } from '../ledger-catalog-events-record-product-created.use-case';

describe('LedgerCatalogEventsRecordProductCreatedUseCase', () => {
  describe('execute', () => {
    it('records the creation under the operation key of the product', async () => {
      const record = jest.fn().mockResolvedValue(undefined);
      const useCase = new LedgerCatalogEventsRecordProductCreatedUseCase({
        record,
      } as unknown as LedgerCatalogEventsRecordService);

      await useCase.execute({
        productId: '12',
        sku: 'SKU-0001',
        name: 'Lamp',
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(record).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001', name: 'Lamp' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
    });
  });
});
