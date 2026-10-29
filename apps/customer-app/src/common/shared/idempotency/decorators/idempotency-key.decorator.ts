import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';
import { IdempotencyKeyHelper } from '../helpers/idempotency-key.helper';

export const IdempotencyKey = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const { headers } = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, Maybe<string | string[]>> }>();

    return IdempotencyKeyHelper.parse(headers['idempotency-key']);
  },
);
