import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { NoteDomainException, NoteErrorCodeEnum } from '../../../domain';
import { NoteHttpExceptionFilter } from '../note-http-exception.filter';

describe('NoteHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: NoteHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new NoteHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new NoteDomainException(NoteErrorCodeEnum.NOTE_NOT_FOUND, 'reason'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['NOTE_SUBJECT_INVALID', 400],
    ['NOTE_BODY_INVALID', 400],
    ['NOTE_VERSION_INVALID', 400],
    ['NOTE_NOT_FOUND', 404],
    ['NOTE_RESOLVED', 409],
    ['VERSION_MISMATCH', 409],
  ])('maps %s to %i with the code and the domain message in the body', (code, status) => {
    filter.catch(
      new NoteDomainException(code as NoteErrorCodeEnum, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
  });

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new NoteDomainException(NoteErrorCodeEnum.NOTE_VERSION_MISMATCH, 'stale', {
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
