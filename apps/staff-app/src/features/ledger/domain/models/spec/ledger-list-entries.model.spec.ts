import { LedgerListEntriesModel } from '../ledger-list-entries.model';

describe('LedgerListEntriesModel', () => {
  describe('toViewData', () => {
    it('answers the snapshot of every listed ledger entry', () => {
      const data = LedgerListEntriesModel.toViewData([
        {
          id: '900',
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: { sku: 'SKU-0001' },
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
          occurredAt: new Date('2026-01-03T00:00:00.000Z'),
          recordedAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ]);

      expect(data).toEqual([
        {
          id: '900',
          operationKey: 'product-created:12',
          subjectType: 'product',
          subjectId: '12',
          action: 'ProductCreated',
          payload: { sku: 'SKU-0001' },
          correlationId: 'c0ffee00-0000-4000-8000-000000000001',
          occurredAt: '2026-01-03T00:00:00.000Z',
          recordedAt: '2026-01-03T00:00:00.000Z',
        },
      ]);
    });

    it('answers no snapshots for no records', () => {
      expect(LedgerListEntriesModel.toViewData([])).toEqual([]);
    });
  });
});
