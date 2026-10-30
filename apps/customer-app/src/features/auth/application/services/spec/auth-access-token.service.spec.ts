import { UserStatusEnum } from '@acme-libs/kernel';
import { AuthCustomerModel } from '../../../domain';
import { AuthAccessTokenService } from '../auth-access-token.service';

describe('AuthAccessTokenService', () => {
  describe('issue', () => {
    it('signs an access token naming only the customer as its subject', async () => {
      const accessToken = { sign: jest.fn().mockResolvedValue('access-token') };
      const service = new AuthAccessTokenService(accessToken);
      const customer = AuthCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      const view = await service.issue(customer);

      expect(view).toEqual({ accessToken: 'access-token' });
      expect(accessToken.sign).toHaveBeenCalledWith({ sub: 'customer-1' });
    });
  });
});
