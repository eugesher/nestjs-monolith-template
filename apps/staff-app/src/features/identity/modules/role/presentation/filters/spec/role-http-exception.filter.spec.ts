import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { AuthPermissionNotFoundException, AuthRoleNotFoundException } from '../../../domain';
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

    filter.catch(new AuthRoleNotFoundException('admin'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['AUTH_ROLE_NOT_FOUND', 404, new AuthRoleNotFoundException('admin', 'domain message')],
    [
      'AUTH_PERMISSION_NOT_FOUND',
      400,
      new AuthPermissionNotFoundException(['unknown:code'], 'domain message'),
    ],
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
