import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { AuthCustomerModel } from '../auth-customer.model';

describe('AuthCustomerModel', () => {
  describe('register', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('creates an active customer with a generated id and a normalized email', () => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue('5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f');

      const customer = AuthCustomerModel.register({
        email: '  Eve@Example.COM ',
        passwordHash: 'hash',
      });

      expect(customer).toMatchObject({
        id: '5f0c6a8e-1d2b-4c3d-8e9f-0a1b2c3d4e5f',
        email: 'eve@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });
    });

    it.each(['eve', 'eve@', '@example.com', 'eve@example', 'e ve@example.com'])(
      'rejects the malformed email %s',
      (email) => {
        const register = (): AuthCustomerModel =>
          AuthCustomerModel.register({ email, passwordHash: 'hash' });

        expect(register).toThrow(
          expect.objectContaining({
            code: IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
            message: 'Customer email must be a well-formed address',
          }) as Error,
        );
      },
    );
  });

  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const customer = AuthCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(customer).toMatchObject({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: 'disabled',
      });
    });
  });

  describe('normalizeEmail', () => {
    it('trims the email and lowers its case', () => {
      const email = AuthCustomerModel.normalizeEmail('  Ann@Example.COM ');

      expect(email).toBe('ann@example.com');
    });
  });

  describe('assertPasswordStrength', () => {
    it('accepts a password of 12 characters', () => {
      const assert = (): void => AuthCustomerModel.assertPasswordStrength('123456789012');

      expect(assert).not.toThrow();
    });

    it('rejects a password of 11 characters with AUTH_PASSWORD_TOO_WEAK', () => {
      const assert = (): void => AuthCustomerModel.assertPasswordStrength('12345678901');

      expect(assert).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
          message: 'Password must be at least 12 characters',
        }) as Error,
      );
    });
  });

  describe('assertActive', () => {
    it('lets an active customer through', () => {
      const customer = AuthCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      expect(() => customer.assertActive()).not.toThrow();
    });

    it('refuses a disabled customer with AUTH_USER_INACTIVE', () => {
      const customer = AuthCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(() => customer.assertActive()).toThrow(
        expect.objectContaining({
          code: IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
          message: 'Customer customer-1 is disabled',
        }) as Error,
      );
    });
  });
});
