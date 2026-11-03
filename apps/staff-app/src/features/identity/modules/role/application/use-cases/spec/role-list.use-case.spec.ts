import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

import { RoleListUseCase } from '../role-list.use-case';

describe('RoleListUseCase', () => {
  it('returns every role with its permission codes', async () => {
    const repository = {
      list: jest.fn().mockResolvedValue([
        {
          id: '1',
          name: RoleEnum.ADMIN,
          rolePermissions: [{ permission: { code: PermissionCodeEnum.IAM_ASSIGN } }],
        },
        {
          id: '3',
          name: RoleEnum.VIEWER,
          rolePermissions: [],
        },
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
