import { LedgerEntry } from '@acme-core/entities';
import { LedgerEntryMapper } from '../ledger-entry.mapper';

describe('LedgerEntryMapper', () => {
  describe('toView', () => {
    it('answers the row with its times as ISO strings', () => {
      const row = Object.assign(new LedgerEntry(), {
        id: '7',
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { title: 'Lamp' },
        correlationId: 'b1e0c5d2-8f3a-4e6b-9c7d-1a2b3c4d5e6f',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: new Date('2026-01-01T00:00:01.120Z'),
      });

      const view = LedgerEntryMapper.toView(row);

      expect(view).toEqual({
        id: '7',
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { title: 'Lamp' },
        correlationId: 'b1e0c5d2-8f3a-4e6b-9c7d-1a2b3c4d5e6f',
        occurredAt: '2026-01-01T00:00:00.000Z',
        recordedAt: '2026-01-01T00:00:01.120Z',
      });
    });
  });
});
