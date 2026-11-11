import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
  type ArgumentsHost,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing/observability';

import { HttpExceptionFilter } from '../http-exception.filter';

describe('HttpExceptionFilter', () => {
  let reply: jest.Mock;
  let logger: PinoLoggerMock;
  let host: ArgumentsHost;
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    reply = jest.fn();
    logger = makePinoLoggerMock();
    host = {
      switchToHttp: () => ({
        getRequest: () => ({ body: { title: 'Lamp', password: 'secret' } }),
        getResponse: () => 'response',
      }),
    } as unknown as ArgumentsHost;
    filter = new HttpExceptionFilter(
      {
        httpAdapter: {
          getRequestMethod: () => 'POST',
          getRequestUrl: () => '/api/items',
          reply,
        },
      } as unknown as HttpAdapterHost,
      logger as unknown as PinoLogger,
    );
  });

  it('answers with the status and body of the exception', () => {
    filter.catch(new NotFoundException('Item not found'), host);

    expect(reply).toHaveBeenCalledWith(
      'response',
      { statusCode: 404, message: 'Item not found', error: 'Not Found' },
      404,
    );
  });

  it('logs a client error as a warning with the masked request body and the response', () => {
    filter.catch(new BadRequestException(['title must be a string']), host);

    expect(logger.warn).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: '/api/items',
        status: 400,
        request: { title: 'Lamp', password: '[REDACTED]' },
        response: {
          statusCode: 400,
          message: ['title must be a string'],
          error: 'Bad Request',
        },
      },
      'Response with error',
    );
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs a server error as an error', () => {
    filter.catch(new ServiceUnavailableException(), host);

    expect(logger.error).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: '/api/items',
        status: 503,
        request: { title: 'Lamp', password: '[REDACTED]' },
        response: { statusCode: 503, message: 'Service Unavailable' },
      },
      'Response with error',
    );
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
