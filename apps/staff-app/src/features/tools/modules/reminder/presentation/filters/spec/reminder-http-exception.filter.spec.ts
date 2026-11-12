import { HttpException, type ArgumentsHost } from '@nestjs/common';

import type { HttpExceptionFilter } from '@acme-libs/http';

import {
  ReminderAlreadyDoneException,
  ReminderBodyInvalidException,
  ReminderDueOnInvalidException,
  ReminderNotFoundException,
  ReminderTitleInvalidException,
  ReminderVersionInvalidException,
  ReminderVersionMismatchException,
} from '../../../domain';
import { ReminderHttpExceptionFilter } from '../reminder-http-exception.filter';

describe('ReminderHttpExceptionFilter', () => {
  let httpExceptionFilter: { catch: jest.Mock<void, [HttpException, ArgumentsHost]> };
  let filter: ReminderHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() as jest.Mock<void, [HttpException, ArgumentsHost]> };
    filter = new ReminderHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new ReminderNotFoundException('1'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['REMINDER_TITLE_INVALID', 400, new ReminderTitleInvalidException(255, 'domain message')],
    ['REMINDER_BODY_INVALID', 400, new ReminderBodyInvalidException(255, 'domain message')],
    [
      'REMINDER_DUE_ON_INVALID',
      400,
      new ReminderDueOnInvalidException('2026-02-30', 'domain message'),
    ],
    ['REMINDER_VERSION_INVALID', 400, new ReminderVersionInvalidException(0, 'domain message')],
    ['REMINDER_NOT_FOUND', 404, new ReminderNotFoundException('1', 'domain message')],
    ['REMINDER_ALREADY_DONE', 409, new ReminderAlreadyDoneException('1', 'domain message')],
    ['VERSION_MISMATCH', 409, new ReminderVersionMismatchException('1', 5, 4, 'domain message')],
  ])(
    'maps %s to %i with the code and the domain message in the body',
    (code, status, exception) => {
      filter.catch(exception, {} as ArgumentsHost);

      const [error] = httpExceptionFilter.catch.mock.calls[0];

      expect(error.getStatus()).toBe(status);
      expect(error.getResponse()).toMatchObject({
        statusCode: status,
        message: 'domain message',
        code,
      });
    },
  );

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new ReminderVersionMismatchException('1', 5, 4, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 409,
      message: 'domain message',
      code: 'VERSION_MISMATCH',
      details: { currentVersion: 4 },
    });
  });
});
