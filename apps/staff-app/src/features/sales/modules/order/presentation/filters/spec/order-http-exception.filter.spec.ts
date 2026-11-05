import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { OrderNotFoundException, OrderTagNotFoundException } from '../../../domain';
import { OrderHttpExceptionFilter } from '../order-http-exception.filter';

describe('OrderHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: OrderHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new OrderHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new OrderNotFoundException('600'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['ORDER_NOT_FOUND', 404, new OrderNotFoundException('600', 'domain message')],
    ['ORDER_TAG_NOT_FOUND', 422, new OrderTagNotFoundException(['999'], 'domain message')],
  ])(
    'maps %s to %i with the code and the domain message in the body',
    (code, status, exception) => {
      filter.catch(exception, {} as ArgumentsHost);

      const [error] = httpExceptionFilter.catch.mock.calls[0];

      expect(error.getStatus()).toBe(status);
      expect(error.getResponse()).toMatchObject({
        statusCode: status,
        message: 'domain message',
        code,
      });
    },
  );

  it('answers the body without details when the exception has none', () => {
    filter.catch(new OrderNotFoundException('600', 'domain message'), {} as ArgumentsHost);

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 404,
      message: 'domain message',
      code: 'ORDER_NOT_FOUND',
    });
  });

  it('adds the missing tags to the body', () => {
    filter.catch(new OrderTagNotFoundException(['998', '999']), {} as ArgumentsHost);

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 422,
      message: 'Some of the tags do not exist',
      code: 'ORDER_TAG_NOT_FOUND',
      details: { missingTagIds: ['998', '999'] },
    });
  });
});
