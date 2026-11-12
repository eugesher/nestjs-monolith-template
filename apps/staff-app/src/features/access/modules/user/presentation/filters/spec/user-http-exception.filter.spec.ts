import { HttpException, type ArgumentsHost } from '@nestjs/common';

import type { HttpExceptionFilter } from '@acme-libs/http';

import {
  AuthEmailInvalidException,
  AuthEmailTakenException,
  AuthPasswordTooWeakException,
  AuthRoleNotFoundException,
  AuthUserNotFoundException,
} from '../../../domain';
import { UserHttpExceptionFilter } from '../user-http-exception.filter';

describe('UserHttpExceptionFilter', () => {
  let httpExceptionFilter: { catch: jest.Mock<void, [HttpException, ArgumentsHost]> };
  let filter: UserHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() as jest.Mock<void, [HttpException, ArgumentsHost]> };
    filter = new UserHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new AuthRoleNotFoundException('1'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['AUTH_EMAIL_INVALID', 400, new AuthEmailInvalidException('domain message')],
    ['AUTH_PASSWORD_TOO_WEAK', 400, new AuthPasswordTooWeakException(12, 'domain message')],
    ['AUTH_USER_NOT_FOUND', 404, new AuthUserNotFoundException('1', 'domain message')],
    ['AUTH_ROLE_NOT_FOUND', 404, new AuthRoleNotFoundException('admin', 'domain message')],
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
