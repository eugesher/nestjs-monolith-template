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
      list.mockResolvedValue({ items: [], total: 0, page: 2, size: 10 });

      await useCase.execute({
        page: 2,
        size: 10,
        subjectType: 'item',
        subjectId: '12',
        correlationId: 'corr-1',
      });

      expect(list).toHaveBeenCalledWith({
        page: 2,
        size: 10,
        subjectType: 'item',
        subjectId: '12',
        correlationId: 'corr-1',
      });
    });

    it('answers the page of the ledger', async () => {
      list.mockResolvedValue({
        items: [
          {
            id: '7',
            operationKey: 'item-archived:12',
            subjectType: 'item',
            subjectId: '12',
            action: 'ItemArchived',
            payload: { title: 'Lamp' },
            correlationId: 'corr-1',
            occurredAt: '2026-01-01T00:00:00.000Z',
            recordedAt: '2026-01-01T00:00:01.000Z',
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      });

      const page = await useCase.execute({});

      expect(page).toEqual({
        items: [
          {
            id: '7',
            operationKey: 'item-archived:12',
            subjectType: 'item',
            subjectId: '12',
            action: 'ItemArchived',
            payload: { title: 'Lamp' },
            correlationId: 'corr-1',
            occurredAt: '2026-01-01T00:00:00.000Z',
            recordedAt: '2026-01-01T00:00:01.000Z',
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      });
    });
  });
});
