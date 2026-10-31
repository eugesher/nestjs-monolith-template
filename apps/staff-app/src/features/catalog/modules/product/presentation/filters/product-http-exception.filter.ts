import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { ProductDomainException, ProductErrorCodeEnum } from '../../domain';

@Catch(ProductDomainException)
export class ProductHttpExceptionFilter implements ExceptionFilter<ProductDomainException> {
  private static readonly STATUS: Record<ProductErrorCodeEnum, HttpStatus> = {
    [ProductErrorCodeEnum.PRODUCT_SKU_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductErrorCodeEnum.PRODUCT_NAME_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductErrorCodeEnum.PRODUCT_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductErrorCodeEnum.PRODUCT_QUANTITY_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductErrorCodeEnum.PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ProductErrorCodeEnum.PRODUCT_ALREADY_ARCHIVED]: HttpStatus.CONFLICT,
    [ProductErrorCodeEnum.PRODUCT_SKU_TAKEN]: HttpStatus.CONFLICT,
    [ProductErrorCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [ProductErrorCodeEnum.PRODUCT_VERSION_MISMATCH]: HttpStatus.CONFLICT,
    [ProductErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ProductDomainException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = ProductHttpExceptionFilter.STATUS[code];
    const body =
      details === undefined
        ? { statusCode, message, code }
        : { statusCode, message, code, details };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
