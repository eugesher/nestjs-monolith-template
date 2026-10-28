import { repositoryConsumers, repositoryConsumerViolations } from './support/repository-consumers';

describe('one repository per use case, service or facade', () => {
  it('every consumer keeps at most one repository of its own in "repository"', () => {
    expect(repositoryConsumerViolations(repositoryConsumers())).toEqual([]);
  });

  describe('the rule itself', () => {
    it.each([
      [
        'a use case with its own repository port',
        [
          {
            name: 'ItemGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemGetHistoryRepositoryPort' }],
          },
        ],
      ],
      [
        'a service with its own repository port',
        [
          {
            name: 'ItemPricingService',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemPricingRepositoryPort' }],
          },
        ],
      ],
      [
        'a global facade with its own repository class',
        [
          {
            name: 'SessionFacade',
            file: 'x',
            params: [{ name: 'repository', type: 'SessionRepository' }],
          },
        ],
      ],
      [
        'the CRUD use cases of a resource sharing its CRUD repository',
        [
          {
            name: 'ItemGetManyUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemCrudRepositoryPort' }],
          },
          {
            name: 'ItemDeleteOneUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemCrudRepositoryPort' }],
          },
        ],
      ],
    ])('accepts %s', (_, consumers) => {
      expect(repositoryConsumerViolations(consumers)).toEqual([]);
    });

    it.each([
      [
        'two repositories',
        [
          {
            name: 'ItemGetHistoryUseCase',
            file: 'x',
            params: [
              { name: 'repository', type: 'IItemGetHistoryRepositoryPort' },
              { name: 'other', type: 'IItemListArchivedRepositoryPort' },
            ],
          },
        ],
      ],
      [
        'a repository kept under another name',
        [
          {
            name: 'ItemGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'categories', type: 'IItemGetHistoryRepositoryPort' }],
          },
        ],
      ],
      [
        'the repository of another consumer',
        [
          {
            name: 'ItemGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemListArchivedRepositoryPort' }],
          },
        ],
      ],
      [
        'a CRUD repository outside the CRUD use cases',
        [
          {
            name: 'ItemGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemCrudRepositoryPort' }],
          },
        ],
      ],
      [
        'the CRUD repository of another resource',
        [
          {
            name: 'NoteGetManyUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IItemCrudRepositoryPort' }],
          },
        ],
      ],
    ])('rejects %s', (_, consumers) => {
      expect(repositoryConsumerViolations(consumers)).not.toEqual([]);
    });
  });
});
