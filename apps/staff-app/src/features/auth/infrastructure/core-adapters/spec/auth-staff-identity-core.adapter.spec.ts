import { DomainException } from '@acme-libs/toolkit';
import { AuthDomainException } from '../../../domain';
import { AuthStaffIdentityCoreAdapter } from '../auth-staff-identity-core.adapter';

describe('AuthStaffIdentityCoreAdapter', () => {
  let login: jest.Mock;
  let validateSubject: jest.Mock;
  let adapter: AuthStaffIdentityCoreAdapter;

  beforeEach(() => {
    login = jest.fn();
    validateSubject = jest.fn();
    adapter = new AuthStaffIdentityCoreAdapter({
      login,
      validateSubject,
      findPermissionCodes: jest.fn(),
    });
  });

  describe('login', () => {
    it('logs in through identity and answers its access token', async () => {
      login.mockResolvedValue({ accessToken: 'access-1' });

      const accessToken = await adapter.login({ email: 'ann@example.com', password: 'secret' });

      expect(accessToken).toEqual({ accessToken: 'access-1' });
      expect(login).toHaveBeenCalledWith({ email: 'ann@example.com', password: 'secret' });
    });

    it('turns an identity refusal into a auth refusal with the same code and message', async () => {
      login.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        }),
      );

      const execution = adapter.login({ email: 'ann@example.com', password: 'wrong' });

      await expect(execution).rejects.toBeInstanceOf(AuthDomainException);
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

  describe('findSubject', () => {
    it('answers the subject identity re-derives for the user', async () => {
      validateSubject.mockResolvedValue({
        id: 'user-1',
        email: 'ann@example.com',
        roles: ['admin'],
      });

      const subject = await adapter.findSubject({ userId: 'user-1' });

      expect(subject).toEqual({ id: 'user-1', email: 'ann@example.com', roles: ['admin'] });
      expect(validateSubject).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });
});
