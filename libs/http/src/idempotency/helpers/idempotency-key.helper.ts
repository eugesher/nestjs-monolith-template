import { BadRequestException, HttpStatus } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';

export class IdempotencyKeyHelper {
  private static readonly MAX_LENGTH = 128;
  private static readonly REQUIRED_CODE = 'IDEMPOTENCY_KEY_REQUIRED';
  private static readonly INVALID_CODE = 'IDEMPOTENCY_KEY_INVALID';

  public static parse(header: Maybe<string | string[]>): string {
    const key = typeof header === 'string' ? header.trim() : '';

    if (key.length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'The Idempotency-Key header is required for this operation',
        code: IdempotencyKeyHelper.REQUIRED_CODE,
      });
    }

    if (key.length > IdempotencyKeyHelper.MAX_LENGTH) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `The Idempotency-Key header must be at most ${IdempotencyKeyHelper.MAX_LENGTH} characters`,
        code: IdempotencyKeyHelper.INVALID_CODE,
      });
    }

    return key;
  }
}
