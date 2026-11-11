import type { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, PermissionCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { RoleReassignPermissionsUseCase } from '../role-reassign-permissions.use-case';

describe('RoleReassignPermissionsUseCase', () => {
  let outcomes: string[];
  let repository: {
    findRole: jest.Mock;
    deleteRolePermissions: jest.Mock;
    insertRolePermissions: jest.Mock;
  };
  let transaction: { run: jest.Mock; afterCommit: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: RoleReassignPermissionsUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      findRole: jest.fn().mockResolvedValue({
        id: '2',
        name: 'editor',
        rolePermissions: [{ code: PermissionCodeEnum.ACCESS_MANAGEMENT }],
      }),
      deleteRolePermissions: jest.fn().mockResolvedValue(undefined),
      insertRolePermissions: jest.fn().mockResolvedValue(undefined),
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
    useCase = new RoleReassignPermissionsUseCase(
      repository,
      transaction,
      logger as unknown as PinoLogger,
    );
  });

  it('reassigns the permissions of the role in one transaction', async () => {
    const view = await useCase.execute({
      roleId: '2',
      permissionCodes: [PermissionCodeEnum.ACCESS_MANAGEMENT, PermissionCodeEnum.PRODUCT_READ],
    });

    expect(view).toEqual({
      id: '2',
      name: 'editor',
      permissionCodes: ['access-management', 'product:read'],
    });
    expect(repository.deleteRolePermissions).toHaveBeenCalledWith('2');
    expect(repository.insertRolePermissions).toHaveBeenCalledWith([
      { roleId: '2', code: 'access-management' },
      { roleId: '2', code: 'product:read' },
    ]);
    expect(outcomes).toEqual(['begin', 'commit']);
    expect(logger.info).toHaveBeenCalledWith(
      { role: 'editor', permissionCodes: ['access-management', 'product:read'] },
      'Role permissions reassigned',
    );
  });

  it('rejects an unknown role', async () => {
    repository.findRole.mockResolvedValue(null);

    const reassign = useCase.execute({ roleId: '1', permissionCodes: [] });

    await expect(reassign).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role 1 was not found',
    });
    expect(repository.deleteRolePermissions).not.toHaveBeenCalled();
  });
});
