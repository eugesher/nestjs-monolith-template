import { HttpException, type ArgumentsHost } from '@nestjs/common';

import type { HttpExceptionFilter } from '@acme-libs/http';

import {
  AuthInvalidCredentialsException,
  AuthUserInactiveException,
  AuthUserNotFoundException,
} from '../../../domain';
import { AuthHttpExceptionFilter } from '../auth-http-exception.filter';

describe('AuthHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: AuthHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new AuthHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new AuthInvalidCredentialsException(), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['AUTH_INVALID_CREDENTIALS', 401, new AuthInvalidCredentialsException('domain message')],
    ['AUTH_USER_INACTIVE', 403, new AuthUserInactiveException('1', 'domain message')],
    ['AUTH_USER_NOT_FOUND', 404, new AuthUserNotFoundException('1', 'domain message')],
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
