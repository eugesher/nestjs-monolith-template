import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { OrderBaseException, OrderErrorCodeEnum } from '../../domain';

@Catch(OrderBaseException)
export class OrderHttpExceptionFilter implements ExceptionFilter<OrderBaseException> {
  private static readonly STATUS: Record<OrderErrorCodeEnum, HttpStatus> = {
    [OrderErrorCodeEnum.ORDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [OrderErrorCodeEnum.ORDER_TAG_NOT_FOUND]: HttpStatus.UNPROCESSABLE_ENTITY,
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
