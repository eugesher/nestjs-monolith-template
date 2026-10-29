import { Customer } from '@acme-core/entities';
import { UserStatusEnum } from '@acme-libs/kernel';
import { CustomerIdentityCoreCustomerMapper } from '../customer-identity-core-customer.mapper';

describe('CustomerIdentityCoreCustomerMapper', () => {
  describe('toModel', () => {
    it('takes the id, the email, the password hash and the status of the row', () => {
      const customer = Object.assign(new Customer(), {
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: UserStatusEnum.ACTIVE,
        createdAt: new Date('2026-01-01T00:00:00Z'),
      });

      const model = CustomerIdentityCoreCustomerMapper.toModel(customer);

      expect(model).toMatchObject({
        id: 'customer-1',
        email: 'ann@example.com',
        passwordHash: 'hash',
        status: 'active',
        isActive: true,
      });
    });
  });
});
