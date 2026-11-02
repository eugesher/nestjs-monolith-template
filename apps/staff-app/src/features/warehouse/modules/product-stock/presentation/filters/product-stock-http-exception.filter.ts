import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { ProductStockBaseException, ProductStockErrorCodeEnum } from '../../domain';

@Catch(ProductStockBaseException)
export class ProductStockHttpExceptionFilter implements ExceptionFilter<ProductStockBaseException> {
  private static readonly STATUS: Record<ProductStockErrorCodeEnum, HttpStatus> = {
    [ProductStockErrorCodeEnum.PRODUCT_QUANTITY_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductStockErrorCodeEnum.PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ProductStockErrorCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [ProductStockErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ProductStockBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = ProductStockHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
