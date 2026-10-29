import { DomainException } from '@acme-libs/toolkit';
import { SessionDomainException } from '../../../domain';
import { SessionIdentityCoreAdapter } from '../session-identity-core.adapter';

describe('SessionIdentityCoreAdapter', () => {
  let login: jest.Mock;
  let adapter: SessionIdentityCoreAdapter;

  beforeEach(() => {
    login = jest.fn();
    adapter = new SessionIdentityCoreAdapter({ login, validateSubject: jest.fn() });
  });

  describe('login', () => {
    it('logs in through identity and answers its access token', async () => {
      login.mockResolvedValue({ accessToken: 'access-1' });

      const accessToken = await adapter.login({ email: 'ann@example.com', password: 'secret' });

      expect(accessToken).toEqual({ accessToken: 'access-1' });
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
});
