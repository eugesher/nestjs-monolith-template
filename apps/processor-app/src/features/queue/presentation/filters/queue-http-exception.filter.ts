import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { QueueBaseException, QueueErrorCodeEnum } from '../../domain';

@Catch(QueueBaseException)
export class QueueHttpExceptionFilter implements ExceptionFilter<QueueBaseException> {
  private static readonly STATUS: Record<QueueErrorCodeEnum, HttpStatus> = {
    [QueueErrorCodeEnum.QUEUE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [QueueErrorCodeEnum.QUEUE_JOB_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [QueueErrorCodeEnum.QUEUE_JOB_NOT_FAILED]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: QueueBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = QueueHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
