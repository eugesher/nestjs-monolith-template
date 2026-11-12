import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  STAFF_AUTH_CORE_PORT,
  StaffAuthCoreLoginOutcomeEnum,
  type IStaffAuthCorePort,
} from '@acme-core/contracts/staff-auth';

import {
  AUTH_IDENTITY_PORT,
  AuthIdentityLoginOutcomeEnum,
  type IAuthIdentityLoginCommand,
  type IAuthIdentityLoginView,
  type IAuthIdentityPort,
} from '../../outbound';

@Injectable()
export class AuthIdentityCoreAdapter implements IAuthIdentityPort {
  public static readonly provider: ClassProvider<IAuthIdentityPort> = {
    provide: AUTH_IDENTITY_PORT,
    useClass: AuthIdentityCoreAdapter,
  };

  private static readonly OUTCOMES: Record<
    StaffAuthCoreLoginOutcomeEnum,
    IAuthIdentityLoginView['outcome']
  > = {
    [StaffAuthCoreLoginOutcomeEnum.LOGGED_IN]: AuthIdentityLoginOutcomeEnum.LOGGED_IN,
    [StaffAuthCoreLoginOutcomeEnum.INVALID_CREDENTIALS]:
      AuthIdentityLoginOutcomeEnum.INVALID_CREDENTIALS,
    [StaffAuthCoreLoginOutcomeEnum.USER_INACTIVE]: AuthIdentityLoginOutcomeEnum.USER_INACTIVE,
  };

  constructor(
    @Inject(STAFF_AUTH_CORE_PORT)
    private readonly staffAuthCore: IStaffAuthCorePort,
  ) {}

  public async login(command: IAuthIdentityLoginCommand): Promise<IAuthIdentityLoginView> {
    const { email, password } = command;
    const login = await this.staffAuthCore.handleLogin({ email, password });
    const { outcome, userId, accessToken } = login;

    return { outcome: AuthIdentityCoreAdapter.OUTCOMES[outcome], userId, accessToken };
  }
}
