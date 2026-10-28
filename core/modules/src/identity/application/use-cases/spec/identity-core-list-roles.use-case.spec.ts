import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IdentityCoreRoleModel } from '../../../domain';
import { IdentityCoreListRolesUseCase } from '../identity-core-list-roles.use-case';

describe('IdentityCoreListRolesUseCase', () => {
  it('returns every role with its permission codes', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue([
        IdentityCoreRoleModel.reconstitute({
          id: 1,
          name: RoleEnum.ADMIN,
          permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
        }),
        IdentityCoreRoleModel.reconstitute({ id: 3, name: RoleEnum.VIEWER, permissionCodes: [] }),
      ]),
    };
    const useCase = new IdentityCoreListRolesUseCase(repository);

    const views = await useCase.execute();

    expect(views).toEqual([
      { name: 'admin', permissionCodes: ['iam:assign'] },
      { name: 'viewer', permissionCodes: [] },
    ]);
  });
});
