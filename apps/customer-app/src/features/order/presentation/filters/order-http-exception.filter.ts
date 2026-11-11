import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { OrderBaseException, OrderExceptionCodeEnum } from '../../domain';

@Catch(OrderBaseException)
export class OrderHttpExceptionFilter implements ExceptionFilter<OrderBaseException> {
  private static readonly STATUS: Record<OrderExceptionCodeEnum, HttpStatus> = {
    [OrderExceptionCodeEnum.ORDER_EMPTY]: HttpStatus.BAD_REQUEST,
    [OrderExceptionCodeEnum.ORDER_PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [OrderExceptionCodeEnum.ORDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [OrderExceptionCodeEnum.ORDER_STOCK_INSUFFICIENT]: HttpStatus.CONFLICT,
    [OrderExceptionCodeEnum.ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [OrderExceptionCodeEnum.ORDER_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: OrderBaseException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = OrderHttpExceptionFilter.STATUS[code];
    const body = details ? { statusCode, message, code, details } : { statusCode, message, code };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
