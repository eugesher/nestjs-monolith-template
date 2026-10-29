import { LedgerCatalogEventsLedgerCoreAdapter } from '../ledger-catalog-events-ledger-core.adapter';

describe('LedgerCatalogEventsLedgerCoreAdapter', () => {
  let append: jest.Mock;
  let adapter: LedgerCatalogEventsLedgerCoreAdapter;

  beforeEach(() => {
    append = jest.fn();
    adapter = new LedgerCatalogEventsLedgerCoreAdapter({ append });
  });

  describe('append', () => {
    it('appends the fact through the core ledger and answers whether it was new', async () => {
      append.mockResolvedValue({ id: '4210', appended: true });

      const result = await adapter.append({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(append).toHaveBeenCalledWith({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: { sku: 'SKU-0001' },
        occurredAt: '2026-01-05T08:00:00.000Z',
      });
      expect(result).toEqual({ appended: true });
    });

    it('answers appended false when the ledger already holds the fact', async () => {
      append.mockResolvedValue({ id: '4210', appended: false });

      const result = await adapter.append({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      expect(result).toEqual({ appended: false });
    });

    it('passes a failing append through', async () => {
      append.mockRejectedValue(new Error('ledger is down'));

      const appending = adapter.append({
        operationKey: 'product-created:12',
        subjectType: 'product',
        subjectId: '12',
        action: 'ProductCreated',
        payload: {},
        occurredAt: '2026-01-05T08:00:00.000Z',
      });

      await expect(appending).rejects.toThrow('ledger is down');
    });
  });
});
