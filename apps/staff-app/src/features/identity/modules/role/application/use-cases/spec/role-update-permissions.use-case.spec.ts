import { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, PermissionCodeEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { RoleUpdatePermissionsUseCase } from '../role-update-permissions.use-case';

describe('RoleUpdatePermissionsUseCase', () => {
  let outcomes: string[];
  let repository: {
    findRole: jest.Mock;
    deleteRolePermissions: jest.Mock;
    insertRolePermissions: jest.Mock;
  };
  let transaction: { run: jest.Mock; afterCommit: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: RoleUpdatePermissionsUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      findRole: jest.fn().mockResolvedValue({
        id: '2',
        name: 'editor',
        rolePermissions: [{ code: PermissionCodeEnum.IDENTITY_ROLE_ASSIGN }],
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
    useCase = new RoleUpdatePermissionsUseCase(
      repository,
      transaction,
      logger as unknown as PinoLogger,
    );
  });

  it('replaces the permissions of the role in one transaction', async () => {
    const view = await useCase.execute({
      roleId: '2',
      permissionCodes: [
        PermissionCodeEnum.IDENTITY_PERMISSION_ASSIGN,
        PermissionCodeEnum.PRODUCT_READ,
      ],
    });

    expect(view).toEqual({
      id: '2',
      name: 'editor',
      permissionCodes: ['identity:permission:assign', 'product:read'],
    });
    expect(repository.deleteRolePermissions).toHaveBeenCalledWith('2');
    expect(repository.insertRolePermissions).toHaveBeenCalledWith([
      { roleId: '2', code: 'identity:permission:assign' },
      { roleId: '2', code: 'product:read' },
    ]);
    expect(outcomes).toEqual(['begin', 'commit']);
    expect(logger.info).toHaveBeenCalledWith(
      { roleId: '2', permissionCodes: ['identity:permission:assign', 'product:read'] },
      'Role permissions replaced',
    );
  });

  it('rejects an unknown role', async () => {
    repository.findRole.mockResolvedValue(null);

    const update = useCase.execute({ roleId: '1', permissionCodes: [] });

    await expect(update).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role admin was not found',
    });
    expect(repository.deleteRolePermissions).not.toHaveBeenCalled();
  });
});
