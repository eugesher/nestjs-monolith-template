import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonUserModel } from '../../../domain';
import { StaffIdentityCommonAccessTokenService } from '../staff-identity-common-access-token.service';

describe('StaffIdentityCommonAccessTokenService', () => {
  describe('issue', () => {
    it('signs an access token naming only the user as its subject', async () => {
      const accessToken = { sign: jest.fn().mockResolvedValue('access-token') };
      const service = new StaffIdentityCommonAccessTokenService(accessToken);
      const user = StaffIdentityCommonUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        roles: [RoleEnum.EDITOR],
      });

      const view = await service.issue(user);

      expect(view).toEqual({ accessToken: 'access-token' });
      expect(accessToken.sign).toHaveBeenCalledWith({ sub: 'user-1' });
    });
  });
});
