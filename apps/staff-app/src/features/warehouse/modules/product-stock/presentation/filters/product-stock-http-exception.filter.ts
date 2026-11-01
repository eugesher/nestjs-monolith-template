import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs-http';

import { ProductStockDomainException, ProductStockErrorCodeEnum } from '../../domain';

@Catch(ProductStockDomainException)
export class ProductStockHttpExceptionFilter implements ExceptionFilter<ProductStockDomainException> {
  private static readonly STATUS: Record<ProductStockErrorCodeEnum, HttpStatus> = {
    [ProductStockErrorCodeEnum.PRODUCT_QUANTITY_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductStockErrorCodeEnum.PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ProductStockErrorCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [ProductStockErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ProductStockDomainException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = ProductStockHttpExceptionFilter.STATUS[code];
    const body =
      details === undefined
        ? { statusCode, message, code }
        : { statusCode, message, code, details };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
