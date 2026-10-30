import { UserStatusEnum } from '@acme-libs/kernel';
import { AuthStaffUserModel } from '../../../domain';
import { AuthAccessTokenService } from '../auth-access-token.service';

describe('AuthAccessTokenService', () => {
  describe('issue', () => {
    it('signs an access token naming only the user as its subject', async () => {
      const accessToken = { sign: jest.fn().mockResolvedValue('access-token') };
      const service = new AuthAccessTokenService(accessToken);
      const user = AuthStaffUserModel.reconstitute({
        id: 'user-1',
        email: 'editor@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      const view = await service.issue(user);

      expect(view).toEqual({ accessToken: 'access-token' });
      expect(accessToken.sign).toHaveBeenCalledWith({ sub: 'user-1' });
    });
  });
});
