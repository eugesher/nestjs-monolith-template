import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { OrderDomainException, OrderErrorCodeEnum } from '../../domain';

@Catch(OrderDomainException)
export class OrderHttpExceptionFilter implements ExceptionFilter<OrderDomainException> {
  private static readonly STATUS: Record<OrderErrorCodeEnum, HttpStatus> = {
    [OrderErrorCodeEnum.ORDER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: OrderDomainException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = OrderHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
