import {
  Catch,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { RequestBodyHelper } from './request-body.helper';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private static readonly SERVER_ERROR_STATUS = 500;
  private static readonly DUPLICATE_KEY_MESSAGE = 'Resource already exists';

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const http = host.switchToHttp();
    const request = http.getRequest<{ body?: unknown }>();
    const answered = HttpExceptionFilter.toHttpException(exception);
    const status = answered.getStatus();
    const exceptionResponse = answered.getResponse();
    const cause = answered === exception ? {} : { err: exception };
    const details = {
      method: httpAdapter.getRequestMethod(request) as string,
      url: httpAdapter.getRequestUrl(request) as string,
      status,
      request: RequestBodyHelper.mask(request.body),
      response: exceptionResponse,
      ...cause,
    };

    if (status >= HttpExceptionFilter.SERVER_ERROR_STATUS) {
      this.logger.error(details, 'Response with error');
    } else {
      this.logger.warn(details, 'Response with error');
    }

    httpAdapter.reply(http.getResponse(), exceptionResponse, status);
  }

  private static toHttpException(exception: unknown): HttpException {
    if (exception instanceof HttpException) {
      return exception;
    }

    if (MysqlErrorHelper.isDuplicateKey(exception)) {
      return new ConflictException(HttpExceptionFilter.DUPLICATE_KEY_MESSAGE);
    }

    return new InternalServerErrorException();
  }
}
