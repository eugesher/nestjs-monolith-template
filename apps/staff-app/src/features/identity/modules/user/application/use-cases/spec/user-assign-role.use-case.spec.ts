import { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { UserAssignRoleUseCase } from '../user-assign-role.use-case';

describe('UserAssignRoleUseCase', () => {
  let repository: { findById: jest.Mock; findRole: jest.Mock; insertUserRole: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: UserAssignRoleUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue({
        id: 'user-1',
        userRoles: [{ role: { name: 'editor' } }],
      }),
      findRole: jest.fn().mockResolvedValue({ id: '3', name: 'viewer' }),
      insertUserRole: jest.fn().mockResolvedValue(undefined),
    };
    logger = makePinoLoggerMock();
    useCase = new UserAssignRoleUseCase(repository, logger as unknown as PinoLogger);
  });

  it('stores a new role and returns every role of the user', async () => {
    const view = await useCase.execute({ userId: 'user-1', roleId: '3' });

    expect(view).toEqual({ id: 'user-1', roles: ['editor', 'viewer'] });
    expect(repository.findRole).toHaveBeenCalledWith('3');
    expect(repository.insertUserRole).toHaveBeenCalledWith({ userId: 'user-1', roleId: '3' });
    expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1', roleId: '3' }, 'Role assigned');
  });

  it('writes nothing for a role the user already has', async () => {
    repository.findRole.mockResolvedValue({ id: '2', name: 'editor' });

    const view = await useCase.execute({ userId: 'user-1', roleId: '2' });

    expect(view).toEqual({ id: 'user-1', roles: ['editor'] });
    expect(repository.insertUserRole).not.toHaveBeenCalled();
  });

  it('rejects an unknown user', async () => {
    repository.findById.mockResolvedValue(null);

    const assign = useCase.execute({ userId: 'ghost', roleId: '3' });

    await expect(assign).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_USER_NOT_FOUND,
      message: 'User ghost was not found',
    });
  });

  it('rejects a role missing from the role table', async () => {
    repository.findRole.mockResolvedValue(null);

    const assign = useCase.execute({ userId: 'user-1', roleId: '1' });

    await expect(assign).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role admin was not found',
    });
    expect(logger.info).not.toHaveBeenCalled();
  });
});
