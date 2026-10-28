import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IAuthCurrentUserView } from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import { IAuthRequest } from '../interfaces/auth-request.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Maybe<IAuthCurrentUserView> =>
    context.switchToHttp().getRequest<IAuthRequest>().user,
);
