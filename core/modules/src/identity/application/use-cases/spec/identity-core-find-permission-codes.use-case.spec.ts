import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreFindPermissionCodesUseCase } from '../identity-core-find-permission-codes.use-case';

describe('IdentityCoreFindPermissionCodesUseCase', () => {
  it('returns the current permission codes of the user', async () => {
    const repository = {
      findPermissionCodes: jest
        .fn()
        .mockResolvedValue([PermissionCodeEnum.ITEM_READ, PermissionCodeEnum.ITEM_WRITE]),
    };
    const useCase = new IdentityCoreFindPermissionCodesUseCase(repository);

    const codes = await useCase.execute({ userId: 'user-1' });

    expect(codes).toEqual(['item:read', 'item:write']);
    expect(repository.findPermissionCodes).toHaveBeenCalledWith('user-1');
  });
});
