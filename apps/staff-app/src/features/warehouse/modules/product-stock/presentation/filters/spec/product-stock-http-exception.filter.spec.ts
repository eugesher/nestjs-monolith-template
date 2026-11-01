import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { ProductStockDomainException, ProductStockErrorCodeEnum } from '../../../domain';
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

    filter.catch(
      new ProductStockDomainException(ProductStockErrorCodeEnum.PRODUCT_NOT_FOUND, 'reason'),
      host,
    );

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['PRODUCT_QUANTITY_INVALID', 400],
    ['PRODUCT_NOT_FOUND', 404],
    ['PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT', 409],
    ['PRODUCT_IDEMPOTENCY_KEY_REUSED', 422],
  ])('maps %s to %i with the code and the domain message in the body', (code, status) => {
    filter.catch(
      new ProductStockDomainException(code as ProductStockErrorCodeEnum, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
  });

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new ProductStockDomainException(ProductStockErrorCodeEnum.PRODUCT_NOT_FOUND, 'missing', {
        productId: '12',
      }),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 404,
      message: 'missing',
      code: 'PRODUCT_NOT_FOUND',
      details: { productId: '12' },
    });
  });
});
