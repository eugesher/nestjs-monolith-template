import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { IdentityCoreException } from '../identity-core.exception';

describe('IdentityCoreException', () => {
  it('is a domain exception that carries its code and message', () => {
    const exception = new IdentityCoreException(
      IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
      'Email editor@example.com is already registered',
    );

    expect(exception).toBeInstanceOf(DomainException);
    expect(exception).toMatchObject({
      name: 'IdentityCoreException',
      code: 'AUTH_EMAIL_TAKEN',
      message: 'Email editor@example.com is already registered',
    });
  });
});
