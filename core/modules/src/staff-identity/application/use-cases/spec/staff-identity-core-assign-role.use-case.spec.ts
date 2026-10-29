import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { StaffIdentityCoreUserModel } from '../../../domain';
import { StaffIdentityCoreAssignRoleUseCase } from '../staff-identity-core-assign-role.use-case';

describe('StaffIdentityCoreAssignRoleUseCase', () => {
  let repository: { findById: jest.Mock; addRole: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: StaffIdentityCoreAssignRoleUseCase;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue(
        StaffIdentityCoreUserModel.reconstitute({
          id: 'user-1',
          email: 'editor@example.com',
          passwordHash: 'hash',
          status: UserStatusEnum.ACTIVE,
          roles: [RoleEnum.EDITOR],
        }),
      ),
      addRole: jest.fn().mockResolvedValue(true),
    };
    logger = makePinoLoggerMock();
    useCase = new StaffIdentityCoreAssignRoleUseCase(repository, logger as unknown as PinoLogger);
  });

  it('stores a new role and returns every role of the user', async () => {
    const view = await useCase.execute({ userId: 'user-1', role: RoleEnum.VIEWER });

    expect(view).toEqual({ id: 'user-1', roles: ['editor', 'viewer'] });
    expect(repository.addRole).toHaveBeenCalledWith('user-1', 'viewer');
    expect(logger.info).toHaveBeenCalledWith({ userId: 'user-1', role: 'viewer' }, 'Role assigned');
  });

  it('writes nothing for a role the user already has', async () => {
    const view = await useCase.execute({ userId: 'user-1', role: RoleEnum.EDITOR });

    expect(view).toEqual({ id: 'user-1', roles: ['editor'] });
    expect(repository.addRole).not.toHaveBeenCalled();
  });

  it('rejects an unknown user', async () => {
    repository.findById.mockResolvedValue(undefined);

    const assign = useCase.execute({ userId: 'ghost', role: RoleEnum.VIEWER });

    await expect(assign).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
      message: 'User ghost was not found',
    });
  });

  it('rejects a role missing from the role table', async () => {
    repository.addRole.mockResolvedValue(false);

    const assign = useCase.execute({ userId: 'user-1', role: RoleEnum.ADMIN });

    await expect(assign).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role admin was not found',
    });
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('assigns a role to a disabled user too', async () => {
    repository.findById.mockResolvedValue(
      StaffIdentityCoreUserModel.reconstitute({
        id: 'user-2',
        email: 'viewer@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
        roles: [],
      }),
    );

    const view = await useCase.execute({ userId: 'user-2', role: RoleEnum.VIEWER });

    expect(view).toEqual({ id: 'user-2', roles: ['viewer'] });
  });
});
