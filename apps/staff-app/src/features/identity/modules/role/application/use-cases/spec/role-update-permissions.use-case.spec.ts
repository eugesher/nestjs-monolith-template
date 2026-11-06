import { PinoLogger } from 'nestjs-pino';

import { IdentityExceptionCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';

import { RoleUpdatePermissionsUseCase } from '../role-update-permissions.use-case';

describe('RoleUpdatePermissionsUseCase', () => {
  let outcomes: string[];
  let repository: {
    findRole: jest.Mock;
    findPermissions: jest.Mock;
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
        name: RoleEnum.EDITOR,
        rolePermissions: [{ permission: { code: PermissionCodeEnum.IAM_ASSIGN } }],
      }),
      findPermissions: jest.fn().mockResolvedValue([
        {
          id: '2',
          code: PermissionCodeEnum.IAM_ROLE_EDIT,
        },
        {
          id: '8',
          code: PermissionCodeEnum.PRODUCT_READ,
        },
      ]),
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
      role: RoleEnum.EDITOR,
      permissionCodes: [PermissionCodeEnum.IAM_ROLE_EDIT, PermissionCodeEnum.PRODUCT_READ],
    });

    expect(view).toEqual({ name: 'editor', permissionCodes: ['iam:role-edit', 'product:read'] });
    expect(repository.findPermissions).toHaveBeenCalledWith(['iam:role-edit', 'product:read']);
    expect(repository.deleteRolePermissions).toHaveBeenCalledWith('2');
    expect(repository.insertRolePermissions).toHaveBeenCalledWith([
      { roleId: '2', permissionId: '2' },
      { roleId: '2', permissionId: '8' },
    ]);
    expect(outcomes).toEqual(['begin', 'commit']);
    expect(logger.info).toHaveBeenCalledWith(
      { role: 'editor', permissionCodes: ['iam:role-edit', 'product:read'] },
      'Role permissions replaced',
    );
  });

  it('rejects an unknown role', async () => {
    repository.findRole.mockResolvedValue(null);

    const update = useCase.execute({ role: RoleEnum.ADMIN, permissionCodes: [] });

    await expect(update).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role admin was not found',
    });
    expect(repository.findPermissions).not.toHaveBeenCalled();
  });

  it('rejects unknown permission codes and writes nothing', async () => {
    const update = useCase.execute({
      role: RoleEnum.EDITOR,
      permissionCodes: [PermissionCodeEnum.IAM_ROLE_EDIT, PermissionCodeEnum.LEDGER_READ],
    });

    await expect(update).rejects.toMatchObject({
      code: IdentityExceptionCodeEnum.AUTH_PERMISSION_NOT_FOUND,
      message: 'Unknown permission codes: ledger:read',
    });
    expect(repository.deleteRolePermissions).not.toHaveBeenCalled();
    expect(outcomes).toEqual(['begin']);
  });
});
