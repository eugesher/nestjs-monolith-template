import { HttpException, type ArgumentsHost } from '@nestjs/common';

import type { HttpExceptionFilter } from '@acme-libs/http';

import {
  AuthEmailInvalidException,
  AuthEmailTakenException,
  AuthInvalidCredentialsException,
  AuthPasswordTooWeakException,
  AuthUserInactiveException,
} from '../../../domain';
import { AuthHttpExceptionFilter } from '../auth-http-exception.filter';

describe('AuthHttpExceptionFilter', () => {
  let httpExceptionFilter: { catch: jest.Mock<void, [HttpException, ArgumentsHost]> };
  let filter: AuthHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() as jest.Mock<void, [HttpException, ArgumentsHost]> };
    filter = new AuthHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new AuthInvalidCredentialsException(), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['AUTH_EMAIL_INVALID', 400, new AuthEmailInvalidException('domain message')],
    ['AUTH_PASSWORD_TOO_WEAK', 400, new AuthPasswordTooWeakException(12, 'domain message')],
    ['AUTH_INVALID_CREDENTIALS', 401, new AuthInvalidCredentialsException('domain message')],
    ['AUTH_USER_INACTIVE', 403, new AuthUserInactiveException('101', 'domain message')],
    ['AUTH_EMAIL_TAKEN', 409, new AuthEmailTakenException('ann@example.com', 'domain message')],
  ])(
    'maps %s to %i with the code and the domain message in the body',
    (code, status, exception) => {
      filter.catch(exception, {} as ArgumentsHost);

      const [error] = httpExceptionFilter.catch.mock.calls[0];

      expect(error.getStatus()).toBe(status);
      expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
    },
  );
});
