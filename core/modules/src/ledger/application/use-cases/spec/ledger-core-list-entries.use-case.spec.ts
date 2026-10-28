import { LedgerCoreEntryModel } from '../../../domain';
import { LedgerCoreListEntriesUseCase } from '../ledger-core-list-entries.use-case';

describe('LedgerCoreListEntriesUseCase', () => {
  let repository: { list: jest.Mock };
  let useCase: LedgerCoreListEntriesUseCase;

  beforeEach(() => {
    repository = {
      list: jest.fn().mockResolvedValue({
        items: [
          LedgerCoreEntryModel.reconstitute({
            id: '4210',
            operationKey: 'item-archived:12',
            subjectType: 'item',
            subjectId: '12',
            action: 'ItemArchived',
            payload: {},
            correlationId: 'corr-1',
            occurredAt: new Date('2026-01-01T00:00:00.000Z'),
            recordedAt: new Date('2026-01-01T00:00:00.120Z'),
          }),
        ],
        total: 137,
        page: 2,
        size: 1,
      }),
    };
    useCase = new LedgerCoreListEntriesUseCase(repository);
  });

  describe('execute', () => {
    it('answers the page of views the repository found by the filter', async () => {
      const page = await useCase.execute({
        page: 2,
        size: 1,
        subjectType: 'item',
        subjectId: '12',
        correlationId: 'corr-1',
      });

      expect(page).toEqual({
        items: [
          {
            id: '4210',
            operationKey: 'item-archived:12',
            subjectType: 'item',
            subjectId: '12',
            action: 'ItemArchived',
            payload: {},
            correlationId: 'corr-1',
            occurredAt: '2026-01-01T00:00:00.000Z',
            recordedAt: '2026-01-01T00:00:00.120Z',
          },
        ],
        total: 137,
        page: 2,
        size: 1,
      });
      expect(repository.list).toHaveBeenCalledWith({
        page: 2,
        size: 1,
        subjectType: 'item',
        subjectId: '12',
        correlationId: 'corr-1',
      });
    });

    it('clamps a missing or oversized window to the defaults and the maximum', async () => {
      await useCase.execute({ size: 1000 });

      expect(repository.list).toHaveBeenCalledWith({
        page: 1,
        size: 100,
        subjectType: undefined,
        subjectId: undefined,
        correlationId: undefined,
      });
    });
  });
});
