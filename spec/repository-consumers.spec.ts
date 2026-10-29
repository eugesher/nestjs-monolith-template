import { repositoryConsumers, repositoryConsumerViolations } from './support/repository-consumers';

describe('one repository per use case, service or facade', () => {
  it('finds the consumers of every area', () => {
    const names = repositoryConsumers().map(({ name }) => name);

    expect(names).toEqual(
      expect.arrayContaining([
        'StaffIdentityCoreAssignRoleUseCase',
        'StaffIdentityCoreFindPermissionCodesUseCase',
        'StaffIdentityCoreListRolesUseCase',
        'StaffIdentityCoreLoginUseCase',
        'StaffIdentityCoreRegisterUserUseCase',
        'StaffIdentityCoreUpdateRolePermissionsUseCase',
        'StaffIdentityCoreValidateSubjectUseCase',
      ]),
    );
  });

  it('every consumer keeps at most one repository of its own in "repository"', () => {
    expect(repositoryConsumerViolations(repositoryConsumers())).toEqual([]);
  });

  describe('the rule itself', () => {
    it.each([
      [
        'a use case with its own repository port',
        [
          {
            name: 'ProductGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductGetHistoryRepositoryPort' }],
          },
        ],
      ],
      [
        'a service with its own repository port',
        [
          {
            name: 'ProductPricingService',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductPricingRepositoryPort' }],
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
            name: 'ProductGetManyUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductCrudRepositoryPort' }],
          },
          {
            name: 'ProductDeleteOneUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductCrudRepositoryPort' }],
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
            name: 'ProductGetHistoryUseCase',
            file: 'x',
            params: [
              { name: 'repository', type: 'IProductGetHistoryRepositoryPort' },
              { name: 'other', type: 'IProductListArchivedRepositoryPort' },
            ],
          },
        ],
      ],
      [
        'a repository kept under another name',
        [
          {
            name: 'ProductGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'categories', type: 'IProductGetHistoryRepositoryPort' }],
          },
        ],
      ],
      [
        'the repository of another consumer',
        [
          {
            name: 'ProductGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductListArchivedRepositoryPort' }],
          },
        ],
      ],
      [
        'a CRUD repository outside the CRUD use cases',
        [
          {
            name: 'ProductGetHistoryUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductCrudRepositoryPort' }],
          },
        ],
      ],
      [
        'the CRUD repository of another resource',
        [
          {
            name: 'NoteGetManyUseCase',
            file: 'x',
            params: [{ name: 'repository', type: 'IProductCrudRepositoryPort' }],
          },
        ],
      ],
    ])('rejects %s', (_, consumers) => {
      expect(repositoryConsumerViolations(consumers)).not.toEqual([]);
    });
  });
});
