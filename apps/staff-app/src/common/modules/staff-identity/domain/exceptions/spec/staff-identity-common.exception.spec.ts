import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { StaffIdentityCommonException } from '../staff-identity-common.exception';

describe('StaffIdentityCommonException', () => {
  it('is a domain exception that carries its code and message', () => {
    const exception = new StaffIdentityCommonException(
      IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
      'Email editor@example.com is already registered',
    );

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toMatchObject({
      name: 'StaffIdentityCommonException',
      code: 'AUTH_EMAIL_TAKEN',
      message: 'Email editor@example.com is already registered',
    });
  });
});
