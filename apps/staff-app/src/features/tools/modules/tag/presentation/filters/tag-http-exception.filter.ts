import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';

import { TagBaseException, TagExceptionCodeEnum } from '../../domain';

@Catch(TagBaseException)
export class TagHttpExceptionFilter implements ExceptionFilter<TagBaseException> {
  private static readonly STATUS: Record<TagExceptionCodeEnum, HttpStatus> = {
    [TagExceptionCodeEnum.TAG_NAME_INVALID]: HttpStatus.BAD_REQUEST,
    [TagExceptionCodeEnum.TAG_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [TagExceptionCodeEnum.TAG_NAME_TAKEN]: HttpStatus.CONFLICT,
  };

  constructor(private readonly httpExceptionFilter: HttpExceptionFilter) {}

  public catch(exception: TagBaseException, host: ArgumentsHost): void {
    const { code, message } = exception;
    const statusCode = TagHttpExceptionFilter.STATUS[code];
    const error = new HttpException({ statusCode, message, code }, statusCode);

    this.httpExceptionFilter.catch(error, host);
  }
}
