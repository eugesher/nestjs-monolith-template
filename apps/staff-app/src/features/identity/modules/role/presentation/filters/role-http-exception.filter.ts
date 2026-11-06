import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { RoleBaseException } from '../../domain';

@Catch(RoleBaseException)
export class RoleHttpExceptionFilter implements ExceptionFilter<RoleBaseException> {
  private static readonly STATUS: Record<IdentityExceptionCodeEnum, HttpStatus> = {
    [IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID]: HttpStatus.BAD_REQUEST,
    [IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK]: HttpStatus.BAD_REQUEST,
    [IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
    [IdentityExceptionCodeEnum.AUTH_USER_INACTIVE]: HttpStatus.FORBIDDEN,
    [IdentityExceptionCodeEnum.AUTH_USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [IdentityExceptionCodeEnum.AUTH_PERMISSION_NOT_FOUND]: HttpStatus.BAD_REQUEST,
    [IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: RoleBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = RoleHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
