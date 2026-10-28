import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { RequestBodyHelper } from './request-body.helper';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  private static readonly SERVER_ERROR_STATUS = 500;

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    @InjectPinoLogger(HttpExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  public catch(exception: HttpException, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const http = host.switchToHttp();
    const request = http.getRequest<{ body?: unknown }>();
    const status = exception.getStatus();
    const response = exception.getResponse();
    const details = {
      method: httpAdapter.getRequestMethod(request) as string,
      url: httpAdapter.getRequestUrl(request) as string,
      status,
      request: RequestBodyHelper.mask(request.body),
      response,
    };

    if (status >= HttpExceptionFilter.SERVER_ERROR_STATUS) {
      this.logger.error(details, 'Response with error');
    } else {
      this.logger.warn(details, 'Response with error');
    }

    httpAdapter.reply(http.getResponse(), response, status);
  }
}
