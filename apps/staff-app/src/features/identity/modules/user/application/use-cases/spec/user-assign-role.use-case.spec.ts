import { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, RoleEnum } from '@acme-libs/kernel';
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
      findRole: jest.fn().mockResolvedValue({ id: '3' }),
      insertUserRole: jest.fn().mockResolvedValue(undefined),
    };
    logger = makePinoLoggerMock();
    useCase = new UserAssignRoleUseCase(repository, logger as unknown as PinoLogger);
  });

  it('stores a new role and returns every role of the user', async () => {
    const view = await useCase.execute({ userId: 'user-1', role: RoleEnum.VIEWER });

    expect(view).toEqual({ id: 'user-1', roles: ['editor', 'viewer'] });
    expect(repository.findRole).toHaveBeenCalledWith('viewer');
    expect(repository.insertUserRole).toHaveBeenCalledWith({ userId: 'user-1', roleId: '3' });
    expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1', role: 'viewer' }, 'Role assigned');
  });

  it('writes nothing for a role the user already has', async () => {
    const view = await useCase.execute({ userId: 'user-1', role: RoleEnum.EDITOR });

    expect(view).toEqual({ id: 'user-1', roles: ['editor'] });
    expect(repository.insertUserRole).not.toHaveBeenCalled();
  });

  it('rejects an unknown user', async () => {
    repository.findById.mockResolvedValue(null);

    const assign = useCase.execute({ userId: 'ghost', role: RoleEnum.VIEWER });

    await expect(assign).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_USER_NOT_FOUND,
      message: 'User ghost was not found',
    });
  });

  it('rejects a role missing from the role table', async () => {
    repository.findRole.mockResolvedValue(null);

    const assign = useCase.execute({ userId: 'user-1', role: RoleEnum.ADMIN });

    await expect(assign).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role admin was not found',
    });
    expect(logger.info).not.toHaveBeenCalled();
  });
});
