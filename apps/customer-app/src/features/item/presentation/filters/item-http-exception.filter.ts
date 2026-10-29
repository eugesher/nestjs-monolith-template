import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { ItemDomainException, ItemErrorCodeEnum } from '../../domain';

@Catch(ItemDomainException)
export class ItemHttpExceptionFilter implements ExceptionFilter<ItemDomainException> {
  private static readonly STATUS: Record<ItemErrorCodeEnum, HttpStatus> = {
    [ItemErrorCodeEnum.ITEM_SKU_INVALID]: HttpStatus.BAD_REQUEST,
    [ItemErrorCodeEnum.ITEM_NAME_INVALID]: HttpStatus.BAD_REQUEST,
    [ItemErrorCodeEnum.ITEM_VERSION_INVALID]: HttpStatus.BAD_REQUEST,
    [ItemErrorCodeEnum.ITEM_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ItemErrorCodeEnum.ITEM_ACCESS_FORBIDDEN]: HttpStatus.FORBIDDEN,
    [ItemErrorCodeEnum.ITEM_ALREADY_ARCHIVED]: HttpStatus.CONFLICT,
    [ItemErrorCodeEnum.ITEM_SKU_TAKEN]: HttpStatus.CONFLICT,
    [ItemErrorCodeEnum.ITEM_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [ItemErrorCodeEnum.ITEM_VERSION_MISMATCH]: HttpStatus.CONFLICT,
    [ItemErrorCodeEnum.ITEM_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: ItemDomainException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = ItemHttpExceptionFilter.STATUS[code];
    const body =
      details === undefined
        ? { statusCode, message, code }
        : { statusCode, message, code, details };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
