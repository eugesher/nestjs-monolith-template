import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { ReminderDomainException, ReminderErrorCodeEnum } from '../../domain';

@Catch(ReminderDomainException)
export class ReminderHttpExceptionFilter implements ExceptionFilter<ReminderDomainException> {
  private static readonly STATUS: Record<ReminderErrorCodeEnum, HttpStatus> = {
    [ReminderErrorCodeEnum.REMINDER_TITLE_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_BODY_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_DUE_ON_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [ReminderErrorCodeEnum.REMINDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ReminderErrorCodeEnum.REMINDER_ACCESS_FORBIDDEN]: HttpStatus.FORBIDDEN,
    [ReminderErrorCodeEnum.REMINDER_ALREADY_DONE]: HttpStatus.CONFLICT,
    [ReminderErrorCodeEnum.REMINDER_VERSION_MISMATCH]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ReminderDomainException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = ReminderHttpExceptionFilter.STATUS[code];
    const body =
      details === undefined
        ? { statusCode, message, code }
        : { statusCode, message, code, details };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
