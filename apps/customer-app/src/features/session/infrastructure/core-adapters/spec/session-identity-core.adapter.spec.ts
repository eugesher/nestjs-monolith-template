import { DomainException } from '@acme-libs/toolkit';
import { SessionDomainException } from '../../../domain';
import { SessionIdentityCoreAdapter } from '../session-identity-core.adapter';

describe('SessionIdentityCoreAdapter', () => {
  let login: jest.Mock;
  let refreshToken: jest.Mock;
  let adapter: SessionIdentityCoreAdapter;

  beforeEach(() => {
    login = jest.fn();
    refreshToken = jest.fn();
    adapter = new SessionIdentityCoreAdapter({ login, refreshToken, validateSubject: jest.fn() });
  });

  describe('login', () => {
    it('logs in through identity and answers its token pair', async () => {
      login.mockResolvedValue({ accessToken: 'access-1', refreshToken: 'refresh-1' });

      const tokenPair = await adapter.login({ email: 'ann@example.com', password: 'secret' });

      expect(tokenPair).toEqual({ accessToken: 'access-1', refreshToken: 'refresh-1' });
      expect(login).toHaveBeenCalledWith({ email: 'ann@example.com', password: 'secret' });
    });

    it('turns an identity refusal into a session refusal with the same code and message', async () => {
      login.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        }),
      );

      const execution = adapter.login({ email: 'ann@example.com', password: 'wrong' });

      await expect(execution).rejects.toBeInstanceOf(SessionDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
    });

    it('rethrows a domain exception with a code identity does not own', async () => {
      const foreign = Object.assign(Object.create(DomainException.prototype) as DomainException, {
        code: 'LEDGER_SOMETHING',
        message: 'Not an identity refusal',
      });

      login.mockRejectedValue(foreign);

      const execution = adapter.login({ email: 'ann@example.com', password: 'secret' });

      await expect(execution).rejects.toBe(foreign);
    });

    it('rethrows an error that is not a domain exception', async () => {
      const failure = new Error('Connection lost');

      login.mockRejectedValue(failure);

      const execution = adapter.login({ email: 'ann@example.com', password: 'secret' });

      await expect(execution).rejects.toBe(failure);
    });
  });

  describe('refresh', () => {
    it('refreshes through identity and answers the fresh pair', async () => {
      refreshToken.mockResolvedValue({ accessToken: 'access-2', refreshToken: 'refresh-2' });

      const tokenPair = await adapter.refresh({ refreshToken: 'refresh-1' });

      expect(tokenPair).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-2' });
      expect(refreshToken).toHaveBeenCalledWith({ refreshToken: 'refresh-1' });
    });

    it('turns an identity refusal into a session refusal with the same code and message', async () => {
      refreshToken.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_REFRESH_TOKEN_INVALID',
          message: 'Refresh token is invalid or expired',
        }),
      );

      const execution = adapter.refresh({ refreshToken: 'refresh-1' });

      await expect(execution).rejects.toBeInstanceOf(SessionDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_REFRESH_TOKEN_INVALID',
        message: 'Refresh token is invalid or expired',
      });
    });

    it('rethrows an error that is not a domain exception', async () => {
      const failure = new Error('Connection lost');

      refreshToken.mockRejectedValue(failure);

      const execution = adapter.refresh({ refreshToken: 'refresh-1' });

      await expect(execution).rejects.toBe(failure);
    });
  });
});
