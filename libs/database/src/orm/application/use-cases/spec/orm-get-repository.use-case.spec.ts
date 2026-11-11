import { Repository, type EntityManager, type QueryRunner } from 'typeorm';

import { HostedRepository } from '../../../../repository/hosted.repository';
import { OrmGetRepositoryUseCase } from '../orm-get-repository.use-case';

describe('OrmGetRepositoryUseCase', () => {
  class Item {}

  let getRepository: jest.Mock;
  let useCase: OrmGetRepositoryUseCase;

  beforeEach(() => {
    getRepository = jest.fn();
    useCase = new OrmGetRepositoryUseCase({ getRepository });
  });

  it('answers a hosted repository over the repository of the host', () => {
    const manager = { name: 'manager' } as unknown as EntityManager;
    const queryRunner = { name: 'runner' } as unknown as QueryRunner;
    const repository = new Repository(Item, manager, queryRunner);
    getRepository.mockReturnValue(repository);

    const result = useCase.execute(Item);

    expect(result).toBeInstanceOf(HostedRepository);
    expect(result.target).toBe(Item);
    expect(result.manager).toBe(manager);
    expect(result.queryRunner).toBe(queryRunner);
    expect(getRepository).toHaveBeenCalledWith(Item);
  });
});
