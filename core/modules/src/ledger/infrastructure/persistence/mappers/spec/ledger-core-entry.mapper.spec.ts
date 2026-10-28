import { LedgerEntry } from '@acme-core/entities';
import { LedgerCoreEntryMapper } from '../ledger-core-entry.mapper';

describe('LedgerCoreEntryMapper', () => {
  describe('toModel', () => {
    it('restores the row as a frozen entry with its string id', () => {
      const row = Object.assign(new LedgerEntry(), {
        id: '4210',
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: new Date('2026-01-01T00:00:00.120Z'),
      });

      const entry = LedgerCoreEntryMapper.toModel(row);

      expect({ ...entry }).toEqual({
        id: '4210',
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: new Date('2026-01-01T00:00:00.120Z'),
      });
      expect(Object.isFrozen(entry)).toBe(true);
    });
  });
});
