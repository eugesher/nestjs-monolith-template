import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { RoleDomainException } from '../../../domain';
import { RoleHttpExceptionFilter } from '../role-http-exception.filter';

describe('RoleHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: RoleHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new RoleHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(
      new RoleDomainException(IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS, 'reason'),
      host,
    );

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['AUTH_EMAIL_INVALID', 400],
    ['AUTH_PASSWORD_TOO_WEAK', 400],
    ['AUTH_INVALID_CREDENTIALS', 401],
    ['AUTH_USER_INACTIVE', 403],
    ['AUTH_USER_NOT_FOUND', 404],
    ['AUTH_ROLE_NOT_FOUND', 404],
    ['AUTH_PERMISSION_NOT_FOUND', 400],
    ['AUTH_EMAIL_TAKEN', 409],
  ])('maps %s to %i with the code and the domain message in the body', (code, status) => {
    filter.catch(
      new RoleDomainException(code as IdentityErrorCodeEnum, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
  });
});
