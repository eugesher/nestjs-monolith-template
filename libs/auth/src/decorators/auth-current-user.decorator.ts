import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { Maybe } from '@acme-libs/toolkit';
import type { IAuthCurrentUserView } from '@acme-libs/contracts/auth';

import type { IAuthRequest } from '../interfaces/auth-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Maybe<IAuthCurrentUserView> =>
    context.switchToHttp().getRequest<IAuthRequest>().user,
);
