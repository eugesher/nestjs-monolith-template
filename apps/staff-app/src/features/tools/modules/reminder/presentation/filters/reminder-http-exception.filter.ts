import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { ReminderBaseException, ReminderErrorCodeEnum } from '../../domain';

@Catch(ReminderBaseException)
export class ReminderHttpExceptionFilter implements ExceptionFilter<ReminderBaseException> {
  private static readonly STATUS: Record<ReminderErrorCodeEnum, HttpStatus> = {
    [ReminderErrorCodeEnum.REMINDER_TITLE_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_BODY_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_DUE_ON_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ReminderErrorCodeEnum.REMINDER_ALREADY_DONE]: HttpStatus.CONFLICT,
    [ReminderErrorCodeEnum.REMINDER_VERSION_MISMATCH]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ReminderBaseException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = ReminderHttpExceptionFilter.STATUS[code];
    const body = details ? { statusCode, message, code, details } : { statusCode, message, code };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
