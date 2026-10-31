import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { OrderDomainException, OrderErrorCodeEnum } from '../../../domain';
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

    filter.catch(new OrderDomainException(OrderErrorCodeEnum.ORDER_NOT_FOUND, 'reason'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it('maps ORDER_NOT_FOUND to 404 with the code and the domain message in the body', () => {
    filter.catch(
      new OrderDomainException(OrderErrorCodeEnum.ORDER_NOT_FOUND, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(404);
    expect(error.getResponse()).toEqual({
      statusCode: 404,
      message: 'domain message',
      code: 'ORDER_NOT_FOUND',
    });
  });
});
