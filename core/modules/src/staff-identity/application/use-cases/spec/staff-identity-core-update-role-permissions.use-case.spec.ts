import { PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { StaffIdentityCorePermissionModel, StaffIdentityCoreRoleModel } from '../../../domain';
import { StaffIdentityCoreUpdateRolePermissionsUseCase } from '../staff-identity-core-update-role-permissions.use-case';

describe('StaffIdentityCoreUpdateRolePermissionsUseCase', () => {
  let outcomes: string[];
  let repository: {
    findRole: jest.Mock;
    findPermissions: jest.Mock;
    replacePermissions: jest.Mock;
  };
  let transaction: { run: jest.Mock };
  let logger: PinoLoggerMock;
  let useCase: StaffIdentityCoreUpdateRolePermissionsUseCase;

  beforeEach(() => {
    outcomes = [];
    repository = {
      findRole: jest.fn().mockResolvedValue(
        StaffIdentityCoreRoleModel.reconstitute({
          id: 2,
          name: RoleEnum.EDITOR,
          permissionCodes: [PermissionCodeEnum.ITEM_READ],
        }),
      ),
      findPermissions: jest.fn().mockResolvedValue([
        StaffIdentityCorePermissionModel.reconstitute({
          id: 2,
          code: PermissionCodeEnum.ITEM_WRITE,
        }),
        StaffIdentityCorePermissionModel.reconstitute({
          id: 8,
          code: PermissionCodeEnum.NOTE_READ,
        }),
      ]),
      replacePermissions: jest.fn().mockResolvedValue(undefined),
    };
    transaction = {
      run: jest.fn(async (work: () => Promise<unknown>) => {
        outcomes.push('begin');

        const result = await work();

        outcomes.push('commit');

        return result;
      }),
    };
    logger = makePinoLoggerMock();
    useCase = new StaffIdentityCoreUpdateRolePermissionsUseCase(
      repository,
      transaction,
      logger as unknown as PinoLogger,
    );
  });

  it('replaces the permissions of the role in one transaction', async () => {
    const view = await useCase.execute({
      role: RoleEnum.EDITOR,
      permissionCodes: [PermissionCodeEnum.ITEM_WRITE, PermissionCodeEnum.NOTE_READ],
    });

    expect(view).toEqual({ name: 'editor', permissionCodes: ['item:write', 'note:read'] });
    expect(repository.findPermissions).toHaveBeenCalledWith(['item:write', 'note:read']);
    expect(repository.replacePermissions).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, permissionCodes: ['item:write', 'note:read'] }),
    );
    expect(outcomes).toEqual(['begin', 'commit']);
    expect(logger.info).toHaveBeenCalledWith(
      { role: 'editor', permissionCodes: ['item:write', 'note:read'] },
      'Role permissions replaced',
    );
  });

  it('rejects an unknown role', async () => {
    repository.findRole.mockResolvedValue(undefined);

    const update = useCase.execute({ role: RoleEnum.ADMIN, permissionCodes: [] });

    await expect(update).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
      message: 'Role admin was not found',
    });
    expect(repository.findPermissions).not.toHaveBeenCalled();
  });

  it('rejects unknown permission codes and writes nothing', async () => {
    const update = useCase.execute({
      role: RoleEnum.EDITOR,
      permissionCodes: [PermissionCodeEnum.ITEM_WRITE, PermissionCodeEnum.LEDGER_READ],
    });

    await expect(update).rejects.toMatchObject({
      code: IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
      message: 'Unknown permission codes: ledger:read',
    });
    expect(repository.replacePermissions).not.toHaveBeenCalled();
    expect(outcomes).toEqual(['begin']);
  });
});
