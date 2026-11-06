import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { ProductBaseException, ProductExceptionCodeEnum } from '../../domain';

@Catch(ProductBaseException)
export class ProductHttpExceptionFilter implements ExceptionFilter<ProductBaseException> {
  private static readonly STATUS: Record<ProductExceptionCodeEnum, HttpStatus> = {
    [ProductExceptionCodeEnum.PRODUCT_SKU_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductExceptionCodeEnum.PRODUCT_NAME_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductExceptionCodeEnum.PRODUCT_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [ProductExceptionCodeEnum.PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ProductExceptionCodeEnum.PRODUCT_ALREADY_ARCHIVED]: HttpStatus.CONFLICT,
    [ProductExceptionCodeEnum.PRODUCT_SKU_TAKEN]: HttpStatus.CONFLICT,
    [ProductExceptionCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [ProductExceptionCodeEnum.PRODUCT_VERSION_MISMATCH]: HttpStatus.CONFLICT,
    [ProductExceptionCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
    [ProductExceptionCodeEnum.PRODUCT_TAG_NOT_FOUND]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ProductBaseException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = ProductHttpExceptionFilter.STATUS[code];
    const body = details ? { statusCode, message, code, details } : { statusCode, message, code };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
