import { ItemLedgerCoreAdapter } from '../item-ledger-core.adapter';

describe('ItemLedgerCoreAdapter', () => {
  let append: jest.Mock;
  let adapter: ItemLedgerCoreAdapter;

  beforeEach(() => {
    append = jest.fn();
    adapter = new ItemLedgerCoreAdapter({ append });
  });

  describe('append', () => {
    it('appends the fact through the core ledger without a correlation id', async () => {
      append.mockResolvedValue({ id: '4210', appended: true });

      await adapter.append({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      expect(append).toHaveBeenCalledWith({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('resolves the same way when the ledger already holds the fact', async () => {
      append.mockResolvedValue({ id: '4210', appended: false });

      const result = await adapter.append({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      expect(result).toBeUndefined();
    });

    it('passes a failing append through', async () => {
      append.mockRejectedValue(new Error('ledger is down'));

      const appending = adapter.append({
        operationKey: 'item-archived:12',
        subjectType: 'item',
        subjectId: '12',
        action: 'ItemArchived',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      await expect(appending).rejects.toThrow('ledger is down');
    });
  });
});
