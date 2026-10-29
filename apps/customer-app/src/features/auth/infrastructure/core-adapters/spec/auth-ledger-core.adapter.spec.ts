import { AuthLedgerCoreAdapter } from '../auth-ledger-core.adapter';

describe('AuthLedgerCoreAdapter', () => {
  let append: jest.Mock;
  let adapter: AuthLedgerCoreAdapter;

  beforeEach(() => {
    append = jest.fn();
    adapter = new AuthLedgerCoreAdapter({ append });
  });

  describe('append', () => {
    it('appends the fact through the core ledger without a correlation id', async () => {
      append.mockResolvedValue({ id: '4210', appended: true });

      await adapter.append({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      expect(append).toHaveBeenCalledWith({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });
    });

    it('resolves the same way when the ledger already holds the fact', async () => {
      append.mockResolvedValue({ id: '4210', appended: false });

      const result = await adapter.append({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      expect(result).toBeUndefined();
    });

    it('passes a failing append through', async () => {
      append.mockRejectedValue(new Error('ledger is down'));

      const appending = adapter.append({
        operationKey: 'customer-registered:customer-1',
        subjectType: 'customer',
        subjectId: 'customer-1',
        action: 'CustomerRegistered',
        payload: {},
        occurredAt: '2026-01-01T00:00:00.000Z',
      });

      await expect(appending).rejects.toThrow('ledger is down');
    });
  });
});
