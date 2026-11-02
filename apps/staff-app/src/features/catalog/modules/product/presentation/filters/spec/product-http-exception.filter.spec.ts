import { ArgumentsHost, HttpException } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import {
  ProductAlreadyArchivedException,
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductNameInvalidException,
  ProductNotFoundException,
  ProductSkuInvalidException,
  ProductSkuTakenException,
  ProductVersionInvalidException,
  ProductVersionMismatchException,
} from '../../../domain';
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

    filter.catch(new ProductNotFoundException('100'), host);

    expect(httpExceptionFilter.catch).toHaveBeenCalledTimes(1);
    expect(httpExceptionFilter.catch).toHaveBeenCalledWith(expect.any(HttpException), host);
  });

  it.each([
    [
      'PRODUCT_SKU_INVALID',
      400,
      new ProductSkuInvalidException(/^[A-Z]+$/, 'SKU-0001', 'domain message'),
    ],
    ['PRODUCT_NAME_INVALID', 400, new ProductNameInvalidException(255, 'domain message')],
    ['PRODUCT_VERSION_INVALID', 400, new ProductVersionInvalidException(0, 'domain message')],
    ['PRODUCT_NOT_FOUND', 404, new ProductNotFoundException('100', 'domain message')],
    ['PRODUCT_ALREADY_ARCHIVED', 409, new ProductAlreadyArchivedException('100', 'domain message')],
    ['PRODUCT_SKU_TAKEN', 409, new ProductSkuTakenException('SKU-0001', 'domain message')],
    [
      'PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT',
      409,
      new ProductIdempotentRequestInFlightException('key-1', 'domain message'),
    ],
    ['VERSION_MISMATCH', 409, new ProductVersionMismatchException('100', 4, 'domain message')],
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
      expect(error.getResponse()).toMatchObject({
        statusCode: status,
        message: 'domain message',
        code,
      });
    },
  );

  it('adds the details of the exception to the body', () => {
    filter.catch(
      new ProductVersionMismatchException('100', 4, 'domain message'),
      {} as ArgumentsHost,
    );

    const [error] = httpExceptionFilter.catch.mock.calls[0];

    expect(error.getResponse()).toEqual({
      statusCode: 409,
      message: 'domain message',
      code: 'VERSION_MISMATCH',
      details: { currentVersion: 4 },
    });
  });
});
