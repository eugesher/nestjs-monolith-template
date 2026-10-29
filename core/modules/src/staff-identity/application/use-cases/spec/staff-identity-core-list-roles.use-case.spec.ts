import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreRoleModel } from '../../../domain';
import { StaffIdentityCoreListRolesUseCase } from '../staff-identity-core-list-roles.use-case';

describe('StaffIdentityCoreListRolesUseCase', () => {
  it('returns every role with its permission codes', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue([
        StaffIdentityCoreRoleModel.reconstitute({
          id: 1,
          name: RoleEnum.ADMIN,
          permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
        }),
        StaffIdentityCoreRoleModel.reconstitute({
          id: 3,
          name: RoleEnum.VIEWER,
          permissionCodes: [],
        }),
      ]),
    };
    const useCase = new StaffIdentityCoreListRolesUseCase(repository);

    const views = await useCase.execute();

    expect(views).toEqual([
      { name: 'admin', permissionCodes: ['iam:assign'] },
      { name: 'viewer', permissionCodes: [] },
    ]);
  });
});
