import { LedgerRecordEntryModel } from '../ledger-record-entry.model';

describe('LedgerRecordEntryModel', () => {
  describe('create', () => {
    it('trims the operation key and the action', () => {
      const entry = LedgerRecordEntryModel.create({
        operationKey: '  product-archived:12 ',
        subjectType: 'product',
        subjectId: '12',
        action: ' ProductArchived ',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect({ ...entry }).toEqual({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it('freezes the entry — a ledger row never changes', () => {
      const entry = LedgerRecordEntryModel.create({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
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
        'ProductArchived',
        '2026-01-01T00:00:00.000Z',
        'LedgerEntry.operationKey is required',
      ],
      [
        'a blank action',
        'product-archived:12',
        ' ',
        '2026-01-01T00:00:00.000Z',
        'LedgerEntry.action is required',
      ],
      [
        'an invalid instant',
        'product-archived:12',
        'ProductArchived',
        'nope',
        'LedgerEntry.occurredAt must be a valid instant',
      ],
    ])('rejects %s', (_case, operationKey, action, occurredAt, message) => {
      const create = (): LedgerRecordEntryModel =>
        LedgerRecordEntryModel.create({
          operationKey,
          subjectType: 'product',
          subjectId: '12',
          action,
          payload: {},
          correlationId: 'corr-1',
          occurredAt: new Date(occurredAt),
        });

      expect(create).toThrow(message);
    });
  });
});
