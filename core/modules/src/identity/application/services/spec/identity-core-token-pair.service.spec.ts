import { PermissionCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { IdentityCoreUserModel } from '../../../domain';
import { IdentityCoreTokenPairService } from '../identity-core-token-pair.service';

describe('IdentityCoreTokenPairService', () => {
  describe('issue', () => {
    it('signs an access token with the claims of the user and a refresh token with its id', async () => {
      const accessToken = {
        signAccess: jest.fn().mockResolvedValue('access-token'),
        signRefresh: jest.fn().mockResolvedValue('refresh-token'),
        verifyRefresh: jest.fn(),
      };
      const service = new IdentityCoreTokenPairService(accessToken);
      const user = IdentityCoreUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: [RoleEnum.EDITOR],
      });

      const pair = await service.issue(user, [
        PermissionCodeEnum.ITEM_READ,
        PermissionCodeEnum.ITEM_WRITE,
      ]);

      expect(pair).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(accessToken.signAccess).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'editor@example.com',
        roles: ['editor'],
        permissions: ['item:read', 'item:write'],
      });
      expect(accessToken.signRefresh).toHaveBeenCalledWith('user-1');
    });
  });
});
