import { IAuthCurrentUserView } from '@acme-libs/contracts/auth';

interface IAuthRequestHeaders {
  authorization?: string;
}

export interface IAuthRequest {
  headers: IAuthRequestHeaders;
  user?: IAuthCurrentUserView;
}
