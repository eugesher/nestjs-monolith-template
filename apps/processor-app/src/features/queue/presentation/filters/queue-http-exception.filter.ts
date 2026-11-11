import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { QueueBaseException, QueueExceptionCodeEnum } from '../../domain';

@Catch(QueueBaseException)
export class QueueHttpExceptionFilter implements ExceptionFilter<QueueBaseException> {
  private static readonly STATUS: Record<QueueExceptionCodeEnum, HttpStatus> = {
    [QueueExceptionCodeEnum.QUEUE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [QueueExceptionCodeEnum.QUEUE_JOB_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [QueueExceptionCodeEnum.QUEUE_JOB_NOT_FAILED]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: QueueBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = QueueHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
