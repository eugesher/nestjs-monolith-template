import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';
import { IfMatchHelper } from '../helpers/if-match.helper';

export const IfMatch = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Maybe<number> => {
    const { headers } = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, Maybe<string | string[]>> }>();

    return IfMatchHelper.parse(headers['if-match']);
  },
);
