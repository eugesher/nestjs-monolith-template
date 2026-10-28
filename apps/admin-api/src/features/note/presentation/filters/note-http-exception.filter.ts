import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { NoteDomainException, NoteErrorCodeEnum } from '../../domain';

@Catch(NoteDomainException)
export class NoteHttpExceptionFilter implements ExceptionFilter<NoteDomainException> {
  private static readonly STATUS: Record<NoteErrorCodeEnum, HttpStatus> = {
    [NoteErrorCodeEnum.NOTE_SUBJECT_INVALID]: HttpStatus.BAD_REQUEST,
    [NoteErrorCodeEnum.NOTE_BODY_INVALID]: HttpStatus.BAD_REQUEST,
    [NoteErrorCodeEnum.NOTE_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [NoteErrorCodeEnum.NOTE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [NoteErrorCodeEnum.NOTE_RESOLVED]: HttpStatus.CONFLICT,
    [NoteErrorCodeEnum.NOTE_VERSION_MISMATCH]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: NoteDomainException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = NoteHttpExceptionFilter.STATUS[code];
    const body =
      details === undefined
        ? { statusCode, message, code }
        : { statusCode, message, code, details };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
