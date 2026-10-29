import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { StaffIdentityCoreException } from '../staff-identity-core.exception';

describe('StaffIdentityCoreException', () => {
  it('is a domain exception that carries its code and message', () => {
    const exception = new StaffIdentityCoreException(
      IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
      'Email editor@example.com is already registered',
    );

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toMatchObject({
      name: 'StaffIdentityCoreException',
      code: 'AUTH_EMAIL_TAKEN',
      message: 'Email editor@example.com is already registered',
    });
  });
});
