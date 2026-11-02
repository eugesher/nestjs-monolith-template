import { AuthAccessTokenLibAdapter } from '../auth-access-token-lib.adapter';

describe('AuthAccessTokenLibAdapter', () => {
  let signAccessToken: jest.Mock;
  let adapter: AuthAccessTokenLibAdapter;

  beforeEach(() => {
    signAccessToken = jest.fn().mockResolvedValue('access-token');
    adapter = new AuthAccessTokenLibAdapter({
      signAccessToken,
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    });
  });

  describe('issue', () => {
    it('signs a token whose subject is the user', async () => {
      const accessToken = await adapter.issue('user-1');

      expect(accessToken).toBe('access-token');
      expect(signAccessToken).toHaveBeenCalledWith({ sub: 'user-1' });
    });
  });
});
