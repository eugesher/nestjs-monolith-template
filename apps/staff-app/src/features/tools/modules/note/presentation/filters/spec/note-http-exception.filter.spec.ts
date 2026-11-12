import { HttpException, type ArgumentsHost } from '@nestjs/common';

import type { HttpExceptionFilter } from '@acme-libs/http';

import {
  NoteBodyInvalidException,
  NoteNotFoundException,
  NoteResolvedException,
  NoteSubjectInvalidException,
  NoteVersionInvalidException,
  NoteVersionMismatchException,
} from '../../../domain';
import { NoteHttpExceptionFilter } from '../note-http-exception.filter';

describe('NoteHttpExceptionFilter', () => {
  let httpExceptionFilter: { catch: jest.Mock<void, [HttpException, ArgumentsHost]> };
  let filter: NoteHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() as jest.Mock<void, [HttpException, ArgumentsHost]> };
    filter = new NoteHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new NoteNotFoundException('1'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['NOTE_SUBJECT_INVALID', 400, new NoteSubjectInvalidException('domain message')],
    ['NOTE_BODY_INVALID', 400, new NoteBodyInvalidException(255, 'domain message')],
    ['NOTE_VERSION_INVALID', 400, new NoteVersionInvalidException(0, 'domain message')],
    ['NOTE_NOT_FOUND', 404, new NoteNotFoundException('1', 'domain message')],
    ['NOTE_RESOLVED', 409, new NoteResolvedException('1', 'domain message')],
    ['VERSION_MISMATCH', 409, new NoteVersionMismatchException('1', 5, 4, 'domain message')],
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
      new NoteVersionMismatchException('1', 5, 4, 'domain message'),
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
