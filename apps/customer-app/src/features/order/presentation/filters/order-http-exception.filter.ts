import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { OrderDomainException, OrderErrorCodeEnum } from '../../domain';

@Catch(OrderDomainException)
export class OrderHttpExceptionFilter implements ExceptionFilter<OrderDomainException> {
  private static readonly STATUS: Record<OrderErrorCodeEnum, HttpStatus> = {
    [OrderErrorCodeEnum.ORDER_EMPTY]: HttpStatus.BAD_REQUEST,
    [OrderErrorCodeEnum.ORDER_PRODUCT_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [OrderErrorCodeEnum.ORDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [OrderErrorCodeEnum.ORDER_STOCK_INSUFFICIENT]: HttpStatus.CONFLICT,
    [OrderErrorCodeEnum.ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT]: HttpStatus.CONFLICT,
    [OrderErrorCodeEnum.ORDER_IDEMPOTENCY_KEY_REUSED]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: OrderDomainException, host: ArgumentsHost): void {
    const { code, message, details } = exception;
    const statusCode = OrderHttpExceptionFilter.STATUS[code];
    const body =
      details === undefined
        ? { statusCode, message, code }
        : { statusCode, message, code, details };
    const error = new HttpException(body, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
