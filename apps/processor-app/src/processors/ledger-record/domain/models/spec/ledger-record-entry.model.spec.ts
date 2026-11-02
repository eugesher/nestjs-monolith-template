import { ILedgerRecordEntryDraft } from '../../interfaces/ledger-record-entry-draft.interface';
import { LedgerRecordEntryModel } from '../ledger-record-entry.model';

describe('LedgerRecordEntryModel', () => {
  describe('createDraft', () => {
    it('trims the operation key and the action', () => {
      const draft = LedgerRecordEntryModel.createDraft({
        operationKey: '  product-archived:12 ',
        subjectType: 'product',
        subjectId: '12',
        action: ' ProductArchived ',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(draft).toEqual({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { previousStatus: 'active' },
        correlationId: 'corr-1',
        occurredAt: new Date('2026-01-01T00:00:00.000Z'),
      });
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
      const createDraft = (): ILedgerRecordEntryDraft =>
        LedgerRecordEntryModel.createDraft({
          operationKey,
          subjectType: 'product',
          subjectId: '12',
          action,
          payload: {},
          correlationId: 'corr-1',
          occurredAt: new Date(occurredAt),
        });

      expect(createDraft).toThrow(message);
    });
  });
});
