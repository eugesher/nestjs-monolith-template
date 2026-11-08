import { IHostedRepository } from '@acme-libs/contracts/database';

import { OrmGetRepositoryUseCase } from '../orm-get-repository.use-case';

describe('OrmGetRepositoryUseCase', () => {
  class Item {}

  let getRepository: jest.Mock;
  let useCase: OrmGetRepositoryUseCase;

  beforeEach(() => {
    getRepository = jest.fn();
    useCase = new OrmGetRepositoryUseCase({ getRepository });
  });

  it('answers the repository of the entity from the host', () => {
    const repository = { target: Item } as unknown as IHostedRepository<Item>;
    getRepository.mockReturnValue(repository);

    const result = useCase.execute(Item);

    expect(result).toBe(repository);
    expect(getRepository).toHaveBeenCalledWith(Item);
  });
});
