import { IdentityExceptionCodeEnum, UserStatusEnum } from '@acme-libs/kernel';

import { IAuthCustomerDraftOutput } from '../../interfaces/outputs/auth-customer-draft.output';
import { AuthCustomerModel } from '../auth-customer.model';

describe('AuthCustomerModel', () => {
  describe('createDraft', () => {
    it('drafts an active customer with a normalized email and no id until it is stored', () => {
      const draft = AuthCustomerModel.createDraft({
        email: '  Eve@Example.COM ',
        passwordHash: 'hash',
      });

      expect(draft).toEqual({
        email: 'eve@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });
    });

    it.each(['eve', 'eve@', '@example.com', 'eve@example', 'e ve@example.com'])(
      'rejects the malformed email %s',
      (email) => {
        const register = (): IAuthCustomerDraftOutput =>
          AuthCustomerModel.createDraft({ email, passwordHash: 'hash' });

        expect(register).toThrow(
          expect.objectContaining({
            code: IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID,
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
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(customer).toMatchObject({
        id: 'customer-1',
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
          code: IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK,
          message: 'Password must be at least 12 characters',
        }) as Error,
      );
    });
  });

  describe('assertActive', () => {
    it('lets an active customer through', () => {
      const customer = AuthCustomerModel.reconstitute({
        id: 'customer-1',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      expect(() => customer.assertActive()).not.toThrow();
    });

    it('refuses a disabled customer with AUTH_USER_INACTIVE', () => {
      const customer = AuthCustomerModel.reconstitute({
        id: 'customer-1',
        passwordHash: 'hash',
        status: UserStatusEnum.DISABLED,
      });

      expect(() => customer.assertActive()).toThrow(
        expect.objectContaining({
          code: IdentityExceptionCodeEnum.AUTH_USER_INACTIVE,
          message: 'Customer customer-1 is disabled',
        }) as Error,
      );
    });
  });
});
