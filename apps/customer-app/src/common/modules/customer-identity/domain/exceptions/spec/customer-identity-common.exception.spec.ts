import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { CustomerIdentityCommonException } from '../customer-identity-common.exception';

describe('CustomerIdentityCommonException', () => {
  it('is a domain exception that carries its code and message', () => {
    const exception = new CustomerIdentityCommonException(
      IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
      'Customer customer-1 is disabled',
    );

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toMatchObject({
      name: 'CustomerIdentityCommonException',
      code: 'AUTH_USER_INACTIVE',
      message: 'Customer customer-1 is disabled',
    });
  });
});
