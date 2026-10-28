import { LedgerCoreEntryModel } from '../ledger-core-entry.model';

describe('LedgerCoreEntryModel', () => {
  describe('create', () => {
    it('trims the operation key and the action and leaves the id and the record time to storage', () => {
      const entry = LedgerCoreEntryModel.create({
        operationKey: '  item-archived:12 ',
        subjectType: 'item',
        subjectId: '12',
        action: ' ItemArchived ',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect({ ...entry }).toEqual({
        id: undefined,
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
        recordedAt: undefined,
      });
    });

    it('freezes the entry — a ledger row never changes', () => {
      const entry = LedgerCoreEntryModel.create({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: {},
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(Object.isFrozen(entry)).toBe(true);
    });

    it.each([
      [
        'a blank operation key',
        '  ',
        'ItemArchived',
        '2026-01-01T00:00:00.000Z',
        'LedgerEntry.operationKey is required',
      ],
      [
        'a blank action',
        'item-archived:12',
        ' ',
        '2026-01-01T00:00:00.000Z',
        'LedgerEntry.action is required',
      ],
      [
        'an invalid instant',
        'item-archived:12',
        'ItemArchived',
        'nope',
        'LedgerEntry.occurredAt must be a valid instant',
      ],
    ])('rejects %s', (_case, operationKey, action, occurredAt, message) => {
      const create = (): LedgerCoreEntryModel =>
        LedgerCoreEntryModel.create({
          operationKey,
          subjectType: 'item',
          subjectId: '12',
          action,
          payload: {},
          correlationId: 'corr-1',
          occurredAt: new Date(occurredAt),
        });

      expect(create).toThrow(message);
    });
  });

  describe('reconstitute', () => {
    it('restores a stored entry as it is, frozen', () => {
      const entry = LedgerCoreEntryModel.reconstitute({
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
