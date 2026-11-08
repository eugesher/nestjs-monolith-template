import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from '../../domain';

@Catch(AuthBaseException)
export class AuthHttpExceptionFilter implements ExceptionFilter<AuthBaseException> {
  private static readonly STATUS: Record<AuthBaseException['code'], HttpStatus> = {
    [IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
    [IdentityExceptionCodeEnum.AUTH_USER_INACTIVE]: HttpStatus.FORBIDDEN,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: AuthBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = AuthHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
