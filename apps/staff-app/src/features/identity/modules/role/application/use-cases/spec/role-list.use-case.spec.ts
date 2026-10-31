import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RoleModel } from '../../../domain';
import { RoleListUseCase } from '../role-list.use-case';

describe('RoleListUseCase', () => {
  it('returns every role with its permission codes', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue([
        RoleModel.reconstitute({
          id: 1,
          name: RoleEnum.ADMIN,
          permissionCodes: [PermissionCodeEnum.IAM_ASSIGN],
        }),
        RoleModel.reconstitute({
          id: 3,
          name: RoleEnum.VIEWER,
          permissionCodes: [],
        }),
      ]),
    };
    const useCase = new RoleListUseCase(repository);

    const views = await useCase.execute();

    expect(views).toEqual([
      { name: 'admin', permissionCodes: ['iam:assign'] },
      { name: 'viewer', permissionCodes: [] },
    ]);
  });
});
