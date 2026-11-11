import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { RoleBaseException } from '../../domain';

@Catch(RoleBaseException)
export class RoleHttpExceptionFilter implements ExceptionFilter<RoleBaseException> {
  private static readonly STATUS: Record<RoleBaseException['code'], HttpStatus> = {
    [IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [IdentityExceptionCodeEnum.AUTH_ROLE_NAME_TAKEN]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: RoleBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = RoleHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
