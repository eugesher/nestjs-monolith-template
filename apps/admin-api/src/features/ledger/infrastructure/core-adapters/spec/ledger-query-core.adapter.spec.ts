import { LedgerQueryCoreAdapter } from '../ledger-query-core.adapter';

describe('LedgerQueryCoreAdapter', () => {
  let list: jest.Mock;
  let adapter: LedgerQueryCoreAdapter;

  beforeEach(() => {
    list = jest.fn();
    adapter = new LedgerQueryCoreAdapter({ list });
  });

  describe('list', () => {
    it('reads the page through the core ledger with the filters of the query', async () => {
      list.mockResolvedValue({ items: [], total: 0, page: 3, size: 5 });

      const page = await adapter.list({
        page: 3,
        size: 5,
        subjectType: 'item',
        subjectId: '12',
        correlationId: 'corr-1',
      });

      expect(page).toEqual({ items: [], total: 0, page: 3, size: 5 });
      expect(list).toHaveBeenCalledWith({
        page: 3,
        size: 5,
        subjectType: 'item',
        subjectId: '12',
        correlationId: 'corr-1',
      });
    });

    it('leaves absent filters absent', async () => {
      list.mockResolvedValue({ items: [], total: 0, page: 1, size: 20 });

      await adapter.list({});

      expect(list).toHaveBeenCalledWith({
        page: undefined,
        size: undefined,
        subjectType: undefined,
        subjectId: undefined,
        correlationId: undefined,
      });
    });
  });
});
