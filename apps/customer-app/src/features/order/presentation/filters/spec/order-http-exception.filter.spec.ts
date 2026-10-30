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

  it.each([
    ['ORDER_EMPTY', 400],
    ['ORDER_PRODUCT_NOT_FOUND', 404],
    ['ORDER_NOT_FOUND', 404],
    ['ORDER_STOCK_INSUFFICIENT', 409],
    ['ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT', 409],
    ['ORDER_IDEMPOTENCY_KEY_REUSED', 422],
  ])('maps %s to %i with the code and the domain message in the body', (code, status) => {
    filter.catch(
      new OrderDomainException(code as OrderErrorCodeEnum, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
  });

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new OrderDomainException(OrderErrorCodeEnum.ORDER_STOCK_INSUFFICIENT, 'domain message', {
        productId: '100',
        requested: 9,
        available: 8,
      }),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 409,
      message: 'domain message',
      code: 'ORDER_STOCK_INSUFFICIENT',
      details: { productId: '100', requested: 9, available: 8 },
    });
  });
});
