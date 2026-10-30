import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonRoleModel } from '../../../domain';
import { StaffIdentityCommonListRolesUseCase } from '../staff-identity-common-list-roles.use-case';

describe('StaffIdentityCommonListRolesUseCase', () => {
  it('returns every role with its permission codes', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue([
        StaffIdentityCommonRoleModel.reconstitute({
          id: 1,
          name: RoleEnum.ADMIN,
          permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
        }),
        StaffIdentityCommonRoleModel.reconstitute({
          id: 3,
          name: RoleEnum.VIEWER,
          permissionCodes: [],
        }),
      ]),
    };
    const useCase = new StaffIdentityCommonListRolesUseCase(repository);

    const views = await useCase.execute();

    expect(views).toEqual([
      { name: 'admin', permissionCodes: ['iam:assign'] },
      { name: 'viewer', permissionCodes: [] },
    ]);
  });
});
