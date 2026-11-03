import { LedgerListEntriesUseCase } from '../ledger-list-entries.use-case';

describe('LedgerListEntriesUseCase', () => {
  let list: jest.Mock;
  let useCase: LedgerListEntriesUseCase;

  beforeEach(() => {
    list = jest.fn();
    useCase = new LedgerListEntriesUseCase({ list });
  });

  describe('execute', () => {
    it('asks the ledger for the page and the filters of the query', async () => {
      list.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({
        page: 2,
        limit: 10,
        subjectType: 'product',
        subjectId: '12',
        correlationId: 'corr-1',
      });

      expect(list).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        offset: 10,
        subjectType: 'product',
        subjectId: '12',
        correlationId: 'corr-1',
      });
    });

    it('reads the first page of 20 when the query names no window', async () => {
      list.mockResolvedValue({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({ subjectType: 'product' });

      expect(list).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        offset: 0,
        subjectType: 'product',
        subjectId: undefined,
        correlationId: undefined,
      });
    });

    it('caps the page limit at 100', async () => {
      list.mockResolvedValue({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });

      await useCase.execute({ limit: 500 });

      expect(list).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        offset: 0,
        subjectType: undefined,
        subjectId: undefined,
        correlationId: undefined,
      });
    });

    it('answers the page of the ledger', async () => {
      list.mockResolvedValue({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [
          {
            id: '7',
            operationKey: 'product-archived:12',
            subjectType: 'product',
            subjectId: '12',
            action: 'ProductArchived',
            payload: { title: 'Lamp' },
            correlationId: 'corr-1',
            occurredAt: '2026-01-01T00:00:00.000Z',
            recordedAt: '2026-01-01T00:00:01.000Z',
          },
        ],
      });

      const page = await useCase.execute({});

      expect(page).toEqual({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [
          {
            id: '7',
            operationKey: 'product-archived:12',
            subjectType: 'product',
            subjectId: '12',
            action: 'ProductArchived',
            payload: { title: 'Lamp' },
            correlationId: 'corr-1',
            occurredAt: '2026-01-01T00:00:00.000Z',
            recordedAt: '2026-01-01T00:00:01.000Z',
          },
        ],
      });
    });
  });
});
