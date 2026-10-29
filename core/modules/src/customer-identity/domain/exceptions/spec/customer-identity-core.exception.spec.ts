import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { CustomerIdentityCoreException } from '../customer-identity-core.exception';

describe('CustomerIdentityCoreException', () => {
  it('is a domain exception that carries its code and message', () => {
    const exception = new CustomerIdentityCoreException(
      IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
      'Customer customer-1 is disabled',
    );

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toMatchObject({
      name: 'CustomerIdentityCoreException',
      code: 'AUTH_USER_INACTIVE',
      message: 'Customer customer-1 is disabled',
    });
  });
});
