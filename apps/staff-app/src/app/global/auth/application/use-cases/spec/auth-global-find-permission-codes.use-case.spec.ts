import { PermissionCodeEnum } from '@acme-libs/kernel';

import { AuthGlobalFindPermissionCodesUseCase } from '../auth-global-find-permission-codes.use-case';

describe('AuthGlobalFindPermissionCodesUseCase', () => {
  it('returns the current permission codes of the user', async () => {
    const repository = {
      findPermissionCodes: jest
        .fn()
        .mockResolvedValue([
          { code: PermissionCodeEnum.IAM_ASSIGN },
          { code: PermissionCodeEnum.IAM_ROLE_EDIT },
        ]),
    };
    const useCase = new AuthGlobalFindPermissionCodesUseCase(repository);

    const codes = await useCase.execute({ userId: 'user-1' });

    expect(codes).toEqual(['iam:assign', 'iam:role-edit']);
    expect(repository.findPermissionCodes).toHaveBeenCalledWith('user-1');
  });
});
