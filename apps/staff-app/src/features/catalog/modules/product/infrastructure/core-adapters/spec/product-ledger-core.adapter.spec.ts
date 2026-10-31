import { ProductLedgerCoreAdapter } from '../product-ledger-core.adapter';

describe('ProductLedgerCoreAdapter', () => {
  let append: jest.Mock;
  let adapter: ProductLedgerCoreAdapter;

  beforeEach(() => {
    append = jest.fn();
    adapter = new ProductLedgerCoreAdapter({ append });
  });

  describe('append', () => {
    it('appends the fact through the core ledger without a correlation id', async () => {
      append.mockResolvedValue({ id: '4210', appended: true });

      await adapter.append({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      expect(append).toHaveBeenCalledWith({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: { sku: 'SKU-0001', previousStatus: 'active' },
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('resolves the same way when the ledger already holds the fact', async () => {
      append.mockResolvedValue({ id: '4210', appended: false });

      const result = await adapter.append({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      expect(result).toBeUndefined();
    });

    it('passes a failing append through', async () => {
      append.mockRejectedValue(new Error('ledger is down'));

      const appending = adapter.append({
        operationKey: 'product-archived:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductArchived',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      await expect(appending).rejects.toThrow('ledger is down');
    });
  });
});
