import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import {
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductNotFoundException,
  ProductQuantityInvalidException,
} from '../../../domain';
import { ProductStockHttpExceptionFilter } from '../product-stock-http-exception.filter';

describe('ProductStockHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: ProductStockHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new ProductStockHttpExceptionFilter(
      httpExceptionFilter as unknown as HttpExceptionFilter,
    );
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(new ProductIdempotentRequestInFlightException('key-1'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    [
      'PRODUCT_QUANTITY_INVALID',
      400,
      new ProductQuantityInvalidException(1000, 0, 'domain message'),
    ],
    ['PRODUCT_NOT_FOUND', 404, new ProductNotFoundException('100', 'domain message')],
    [
      'PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT',
      409,
      new ProductIdempotentRequestInFlightException('key-1', 'domain message'),
    ],
    [
      'PRODUCT_IDEMPOTENCY_KEY_REUSED',
      422,
      new ProductIdempotencyKeyReusedException('key-1', 'domain message'),
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
