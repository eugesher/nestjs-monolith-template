import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { ReminderDomainException, ReminderErrorCodeEnum } from '../../../domain';
import { ReminderHttpExceptionFilter } from '../reminder-http-exception.filter';

describe('ReminderHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: ReminderHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new ReminderHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(
      new ReminderDomainException(ReminderErrorCodeEnum.REMINDER_NOT_FOUND, 'reason'),
      host,
    );

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['REMINDER_TITLE_INVALID', 400],
    ['REMINDER_BODY_INVALID', 400],
    ['REMINDER_DUE_ON_INVALID', 400],
    ['REMINDER_VERSION_INVALID', 400],
    ['REMINDER_NOT_FOUND', 404],
    ['REMINDER_ACCESS_FORBIDDEN', 403],
    ['REMINDER_ALREADY_DONE', 409],
    ['VERSION_MISMATCH', 409],
  ])('maps %s to %i with the code and the domain message in the body', (code, status) => {
    filter.catch(
      new ReminderDomainException(code as ReminderErrorCodeEnum, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
  });

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new ReminderDomainException(ReminderErrorCodeEnum.REMINDER_VERSION_MISMATCH, 'stale', {
        currentVersion: 4,
      }),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 409,
      message: 'stale',
      code: 'VERSION_MISMATCH',
      details: { currentVersion: 4 },
    });
  });
});
