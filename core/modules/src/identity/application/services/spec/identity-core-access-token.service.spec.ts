import { PermissionCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { IdentityCoreUserModel } from '../../../domain';
import { IdentityCoreAccessTokenService } from '../identity-core-access-token.service';

describe('IdentityCoreAccessTokenService', () => {
  describe('issue', () => {
    it('signs an access token with the claims of the user', async () => {
      const accessToken = { sign: jest.fn().mockResolvedValue('access-token') };
      const service = new IdentityCoreAccessTokenService(accessToken);
      const user = IdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: [RoleEnum.EDITOR],
      });

      const view = await service.issue(user, [
        PermissionCodeEnum.ITEM_READ,
        PermissionCodeEnum.ITEM_WRITE,
      ]);

      expect(view).toEqual({ accessToken: 'access-token' });
      expect(accessToken.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'editor@example.com',
        roles: ['editor'],
        permissions: ['item:read', 'item:write'],
      });
    });
  });
});
