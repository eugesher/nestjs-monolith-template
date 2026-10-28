import { BadRequestException, HttpStatus } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';

export class IfMatchHelper {
  private static readonly INVALID_CODE = 'IF_MATCH_INVALID';
  private static readonly QUOTED = /^"(.*)"$/;

  public static parse(header: Maybe<string | string[]>): Maybe<number> {
    if (typeof header !== 'string') {
      return undefined;
    }

    const value = header.trim().replace(IfMatchHelper.QUOTED, '$1');

    if (value.length === 0) {
      return undefined;
    }

    const version = Number(value);

    if (!Number.isInteger(version) || version < 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'The If-Match header must be a non-negative integer version',
        code: IfMatchHelper.INVALID_CODE,
      });
    }

    return version;
  }
}
