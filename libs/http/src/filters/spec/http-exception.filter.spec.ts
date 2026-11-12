import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
  type ArgumentsHost,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { HttpAdapterHost } from '@nestjs/core';
import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

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

  it('answers a duplicate key with 409 and logs it as a warning with the query failure', () => {
    const driverError = Object.assign(new Error('Duplicate entry'), { errno: 1062 });
    const exception = new QueryFailedError('INSERT', [], driverError);

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      'response',
      { statusCode: 409, message: 'Resource already exists', error: 'Conflict' },
      409,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: '/api/items',
        status: 409,
        request: { title: 'Lamp', password: '[REDACTED]' },
        response: { statusCode: 409, message: 'Resource already exists', error: 'Conflict' },
        err: exception,
      },
      'Response with error',
    );
  });

  it('answers another query failure with 500 and logs it as an error with the failure', () => {
    const driverError = Object.assign(new Error('Deadlock'), { errno: 1213 });
    const exception = new QueryFailedError('UPDATE', [], driverError);

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      'response',
      { statusCode: 500, message: 'Internal Server Error' },
      500,
    );
    expect(logger.error).toHaveBeenCalledWith(
      {
        method: 'POST',
        url: '/api/items',
        status: 500,
        request: { title: 'Lamp', password: '[REDACTED]' },
        response: { statusCode: 500, message: 'Internal Server Error' },
        err: exception,
      },
      'Response with error',
    );
  });

  it('answers an unknown error with 500 without its message', () => {
    const exception = new Error('connect ECONNREFUSED 10.0.0.7:3306');

    filter.catch(exception, host);

    expect(reply).toHaveBeenCalledWith(
      'response',
      { statusCode: 500, message: 'Internal Server Error' },
      500,
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500, err: exception }),
      'Response with error',
    );
  });
});
