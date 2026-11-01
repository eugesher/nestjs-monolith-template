import { IAuthCurrentUserView } from '@acme-libs/contracts/auth';

export interface IAuthRequest {
  headers: { authorization?: string };
  user?: IAuthCurrentUserView;
}
