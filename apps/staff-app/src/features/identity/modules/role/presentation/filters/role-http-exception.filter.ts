import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { RoleDomainException } from '../../domain';

@Catch(RoleDomainException)
export class RoleHttpExceptionFilter implements ExceptionFilter<RoleDomainException> {
  private static readonly STATUS: Record<IdentityErrorCodeEnum, HttpStatus> = {
    [IdentityErrorCodeEnum.AUTH_EMAIL_INVALID]: HttpStatus.BAD_REQUEST,
    [IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK]: HttpStatus.BAD_REQUEST,
    [IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
    [IdentityErrorCodeEnum.AUTH_USER_INACTIVE]: HttpStatus.FORBIDDEN,
    [IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND]: HttpStatus.BAD_REQUEST,
    [IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: RoleDomainException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = RoleHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
