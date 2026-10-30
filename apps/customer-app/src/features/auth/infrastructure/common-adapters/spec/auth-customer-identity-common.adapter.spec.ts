import { DomainException } from '@acme-libs/toolkit';
import { AuthDomainException } from '../../../domain';
import { AuthCustomerIdentityCommonAdapter } from '../auth-customer-identity-common.adapter';

describe('AuthCustomerIdentityCommonAdapter', () => {
  let register: jest.Mock;
  let login: jest.Mock;
  let adapter: AuthCustomerIdentityCommonAdapter;

  beforeEach(() => {
    register = jest.fn();
    login = jest.fn();
    adapter = new AuthCustomerIdentityCommonAdapter({
      register,
      login,
      validateSubject: jest.fn(),
    });
  });

  describe('register', () => {
    it('registers through identity and answers the created customer', async () => {
      register.mockResolvedValue({ id: 'customer-1', email: 'eve@example.com' });

      const customer = await adapter.register({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });

      expect(customer).toEqual({ id: 'customer-1', email: 'eve@example.com' });
      expect(register).toHaveBeenCalledWith({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });
    });

    it('turns an identity refusal into a auth refusal with the same code and message', async () => {
      register.mockRejectedValue(
        Object.assign(Object.create(DomainException.prototype) as DomainException, {
          code: 'AUTH_EMAIL_TAKEN',
          message: 'Email ann@example.com is already registered',
        }),
      );

      const execution = adapter.register({
        email: 'ann@example.com',
        password: 'long-enough-password',
      });

      await expect(execution).rejects.toBeInstanceOf(AuthDomainException);
      await expect(execution).rejects.toMatchObject({
        code: 'AUTH_EMAIL_TAKEN',
        message: 'Email ann@example.com is already registered',
      });
    });

    it('rethrows an error that is not a domain exception', async () => {
      const failure = new Error('Connection lost');

      register.mockRejectedValue(failure);

      const execution = adapter.register({
        email: 'eve@example.com',
        password: 'long-enough-password',
      });

      await expect(execution).rejects.toBe(failure);
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
});
