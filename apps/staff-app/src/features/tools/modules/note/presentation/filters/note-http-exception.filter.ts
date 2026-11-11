import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { NoteBaseException, NoteExceptionCodeEnum } from '../../domain';

@Catch(NoteBaseException)
export class NoteHttpExceptionFilter implements ExceptionFilter<NoteBaseException> {
  private static readonly STATUS: Record<NoteExceptionCodeEnum, HttpStatus> = {
    [NoteExceptionCodeEnum.NOTE_SUBJECT_INVALID]: HttpStatus.BAD_REQUEST,
    [NoteExceptionCodeEnum.NOTE_BODY_INVALID]: HttpStatus.BAD_REQUEST,
    [NoteExceptionCodeEnum.NOTE_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [NoteExceptionCodeEnum.NOTE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [NoteExceptionCodeEnum.NOTE_RESOLVED]: HttpStatus.CONFLICT,
    [NoteExceptionCodeEnum.NOTE_VERSION_MISMATCH]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: NoteBaseException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = NoteHttpExceptionFilter.STATUS[code];
    const body = details ? { statusCode, message, code, details } : { statusCode, message, code };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
