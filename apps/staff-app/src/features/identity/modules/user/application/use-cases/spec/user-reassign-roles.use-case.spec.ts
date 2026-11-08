import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { UserReassignRolesUseCase } from '../user-reassign-roles.use-case';

describe('UserReassignRolesUseCase', () => {
  let outcomes: string[];
  let repository: { deleteUserRolesExcept: jest.Mock; insertUserRolesIgnore: jest.Mock };
  let transaction: { run: jest.Mock; afterCommit: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: UserReassignRolesUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      deleteUserRolesExcept: jest.fn(() => {
        outcomes.push('delete');

        return Promise.resolve();
      }),
      insertUserRolesIgnore: jest.fn(() => {
        outcomes.push('insert');

        return Promise.resolve();
      }),
    };
    transaction = {
      afterCommit: jest.fn(),
      run: jest.fn(async (work: () => Promise<unknown>) => {
        outcomes.push('begin');

        const result = await work();

        outcomes.push('commit');

        return result;
      }),
    };
    logger = makePinoLoggerMock();
    useCase = new UserReassignRolesUseCase(
      repository,
      transaction,
      logger as unknown as PinoLogger,
    );
  });

  it('deletes the other roles and inserts the given ones in one transaction', async () => {
    const view = await useCase.execute({ userId: 'user-1', roleIds: ['2', '3'] });

    expect(view).toEqual({ id: 'user-1', roleIds: ['2', '3'] });
    expect(repository.deleteUserRolesExcept).toHaveBeenCalledWith('user-1', ['2', '3']);
    expect(repository.insertUserRolesIgnore).toHaveBeenCalledWith([
      { userId: 'user-1', roleId: '2' },
      { userId: 'user-1', roleId: '3' },
    ]);
    expect(outcomes).toEqual(['begin', 'delete', 'insert', 'commit']);
    expect(logger.info).toHaveBeenCalledWith(
      { userId: 'user-1', roleIds: ['2', '3'] },
      'Roles reassigned',
    );
  });

  it('clears the roles with an empty list', async () => {
    const view = await useCase.execute({ userId: 'user-1', roleIds: [] });

    expect(view).toEqual({ id: 'user-1', roleIds: [] });
    expect(repository.deleteUserRolesExcept).toHaveBeenCalledWith('user-1', []);
    expect(repository.insertUserRolesIgnore).toHaveBeenCalledWith([]);
  });
});
