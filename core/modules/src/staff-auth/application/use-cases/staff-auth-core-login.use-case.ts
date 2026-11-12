import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import {
  StaffAuthCoreLoginOutcomeEnum,
  type IStaffAuthCoreLoginCommand,
  type IStaffAuthCoreLoginView,
} from '@acme-core/contracts/staff-auth';

import { StaffAuthCoreUserModel } from '../../domain';
import {
  STAFF_AUTH_CORE_CREDENTIALS_PORT,
  STAFF_AUTH_CORE_LOGIN_REPOSITORY_PORT,
  type IStaffAuthCoreCredentialsPort,
  type IStaffAuthCoreLoginRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffAuthCoreLoginUseCase {
  constructor(
    @Inject(STAFF_AUTH_CORE_LOGIN_REPOSITORY_PORT)
    private readonly repository: IStaffAuthCoreLoginRepositoryPort,
    @Inject(STAFF_AUTH_CORE_CREDENTIALS_PORT)
    private readonly credentials: IStaffAuthCoreCredentialsPort,
    @InjectPinoLogger(StaffAuthCoreLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IStaffAuthCoreLoginCommand): Promise<IStaffAuthCoreLoginView> {
    const { email, password } = command;
    const normalized = StaffAuthCoreUserModel.normalizeEmail(email);
    const record = await this.repository.findByEmail(normalized);
    const user = record ? StaffAuthCoreUserModel.reconstitute(record) : null;
    const passwordHash = user?.passwordHash ?? null;
    const valid = await this.credentials.verifyPassword({ passwordHash, password });

    if (!user) {
      this.logger.warn('Login failed: unknown email');

      return {
        outcome: StaffAuthCoreLoginOutcomeEnum.INVALID_CREDENTIALS,
        userId: undefined,
        accessToken: undefined,
      };
    }

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      return {
        outcome: StaffAuthCoreLoginOutcomeEnum.INVALID_CREDENTIALS,
        userId: undefined,
        accessToken: undefined,
      };
    }

    if (!user.isActive()) {
      return {
        outcome: StaffAuthCoreLoginOutcomeEnum.USER_INACTIVE,
        userId: user.id,
        accessToken: undefined,
      };
    }

    const accessToken = await this.credentials.issueAccessToken(user.id);

    this.logger.info({ userId: user.id }, 'User logged in');

    return { outcome: StaffAuthCoreLoginOutcomeEnum.LOGGED_IN, userId: user.id, accessToken };
  }
}
