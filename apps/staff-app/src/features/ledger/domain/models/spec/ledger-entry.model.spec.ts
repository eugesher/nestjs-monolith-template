import { LedgerEntryModel } from '../ledger-entry.model';

describe('LedgerEntryModel', () => {
  describe('toSnapshot', () => {
    it('answers a stored entry with its dates as ISO strings', () => {
      const entry = LedgerEntryModel.reconstitute({
        id: '7',
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { title: 'Lamp' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: new Date('2026-01-01T00:00:01.000Z'),
      });

      expect(entry.toSnapshot()).toEqual({
        id: '7',
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { title: 'Lamp' },
        correlationId: 'corr-1',
        occurredAt: '2026-01-01T00:00:00.000Z',
        recordedAt: '2026-01-01T00:00:01.000Z',
      });
    });
  });
});
