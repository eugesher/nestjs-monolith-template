import { LedgerCoreEntryModel } from '../../../domain';
import { LedgerCoreEntryViewMapper } from '../ledger-core-entry-view.mapper';

describe('LedgerCoreEntryViewMapper', () => {
  describe('toView', () => {
    it('answers a stored entry with ISO instants', () => {
      const entry = LedgerCoreEntryModel.reconstitute({
        id: '4210',
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: new Date('2026-01-01T00:00:00.120Z'),
      });

      const view = LedgerCoreEntryViewMapper.toView(entry);

      expect(view).toEqual({
        id: '4210',
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: '2026-01-01T00:00:00.000Z',
        recordedAt: '2026-01-01T00:00:00.120Z',
      });
    });

    it('answers an entry not stored yet with an empty id and its occurrence as the record time', () => {
      const entry = LedgerCoreEntryModel.create({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: {},
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      const view = LedgerCoreEntryViewMapper.toView(entry);

      expect(view).toMatchObject({ id: '', recordedAt: '2026-01-01T00:00:00.000Z' });
    });
  });
});
