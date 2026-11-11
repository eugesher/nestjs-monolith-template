import { Catch, ConflictException, type ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

@Catch(QueryFailedError)
export class DuplicateKeyExceptionFilter extends BaseExceptionFilter {
  public override catch(exception: QueryFailedError, host: ArgumentsHost): void {
    if (MysqlErrorHelper.isDuplicateKey(exception)) {
      const conflict = new ConflictException('Resource already exists');

      super.catch(conflict, host);

      return;
    }

    super.catch(exception, host);
  }
}
