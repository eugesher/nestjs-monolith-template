import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import {
  QueueJobNotFailedException,
  QueueJobNotFoundException,
  QueueNotFoundException,
} from '../../../domain';
import { QueueHttpExceptionFilter } from '../queue-http-exception.filter';

describe('QueueHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: QueueHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new QueueHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new QueueNotFoundException('unknown'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['QUEUE_NOT_FOUND', 404, new QueueNotFoundException('unknown', 'domain message')],
    [
      'QUEUE_JOB_NOT_FOUND',
      404,
      new QueueJobNotFoundException('ledger-record', '7', 'domain message'),
    ],
    [
      'QUEUE_JOB_NOT_FAILED',
      409,
      new QueueJobNotFailedException('ledger-record', '7', 'waiting', 'domain message'),
    ],
  ])(
    'maps %s to %i with the code and the domain message in the body',
    (code, status, exception) => {
      filter.catch(exception, {} as ArgumentsHost);

      const [error] = httpExceptionFilter.catch.mock.calls[0];

      expect(error.getStatus()).toBe(status);
      expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
    },
  );
});
