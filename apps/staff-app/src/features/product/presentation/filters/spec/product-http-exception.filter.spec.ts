import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { ProductDomainException, ProductErrorCodeEnum } from '../../../domain';
import { ProductHttpExceptionFilter } from '../product-http-exception.filter';

describe('ProductHttpExceptionFilter', () => {
  let httpExceptionFilter: jest.Mocked<Pick<HttpExceptionFilter, 'catch'>>;
  let filter: ProductHttpExceptionFilter;

  beforeEach(() => {
    httpExceptionFilter = { catch: jest.fn() };
    filter = new ProductHttpExceptionFilter(httpExceptionFilter as unknown as HttpExceptionFilter);
  });

  it('hands the HttpException over together with the same host', () => {
    const host = {} as ArgumentsHost;

    filter.catch(
      new ProductDomainException(ProductErrorCodeEnum.PRODUCT_NOT_FOUND, 'reason'),
      host,
    );

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    ['PRODUCT_SKU_INVALID', 400],
    ['PRODUCT_NAME_INVALID', 400],
    ['PRODUCT_VERSION_INVALID', 400],
    ['PRODUCT_NOT_FOUND', 404],
    ['PRODUCT_ALREADY_ARCHIVED', 409],
    ['PRODUCT_SKU_TAKEN', 409],
    ['PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT', 409],
    ['VERSION_MISMATCH', 409],
    ['PRODUCT_IDEMPOTENCY_KEY_REUSED', 422],
  ])('maps %s to %i with the code and the domain message in the body', (code, status) => {
    filter.catch(
      new ProductDomainException(code as ProductErrorCodeEnum, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ statusCode: status, message: 'domain message', code });
  });

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new ProductDomainException(ProductErrorCodeEnum.PRODUCT_VERSION_MISMATCH, 'stale', {
        currentVersion: 4,
      }),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 409,
      message: 'stale',
      code: 'VERSION_MISMATCH',
      details: { currentVersion: 4 },
    });
  });
});
