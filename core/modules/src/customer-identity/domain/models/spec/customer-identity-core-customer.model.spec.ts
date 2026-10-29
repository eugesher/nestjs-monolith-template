import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { CustomerIdentityCoreCustomerModel } from '../customer-identity-core-customer.model';

describe('CustomerIdentityCoreCustomerModel', () => {
  describe('reconstitute', () => {
    it('keeps the stored state as is', () => {
      const customer = CustomerIdentityCoreCustomerModel.reconstitute({
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
        isActive: false,
      });
    });
  });

  describe('normalizeEmail', () => {
    it('trims the email and lowers its case', () => {
      const email = CustomerIdentityCoreCustomerModel.normalizeEmail('  Ann@Example.COM ');

      expect(email).toBe('ann@example.com');
    });
  });

  describe('assertActive', () => {
    it('lets an active customer through', () => {
      const customer = CustomerIdentityCoreCustomerModel.reconstitute({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
      });

      expect(() => customer.assertActive()).not.toThrow();
    });

    it('refuses a disabled customer with AUTH_USER_INACTIVE', () => {
      const customer = CustomerIdentityCoreCustomerModel.reconstitute({
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
