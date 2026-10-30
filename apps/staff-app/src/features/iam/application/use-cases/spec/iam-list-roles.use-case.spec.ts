import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IamRoleModel } from '../../../domain';
import { IamListRolesUseCase } from '../iam-list-roles.use-case';

describe('IamListRolesUseCase', () => {
  it('returns every role with its permission codes', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue([
        IamRoleModel.reconstitute({
          id: 1,
          name: RoleEnum.ADMIN,
          permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
        }),
        IamRoleModel.reconstitute({
          id: 3,
          name: RoleEnum.VIEWER,
          permissionCodes: [],
        }),
      ]),
    };
    const useCase = new IamListRolesUseCase(repository);

    const views = await useCase.execute();

    expect(views).toEqual([
      { name: 'admin', permissionCodes: ['iam:assign'] },
      { name: 'viewer', permissionCodes: [] },
    ]);
  });
});
