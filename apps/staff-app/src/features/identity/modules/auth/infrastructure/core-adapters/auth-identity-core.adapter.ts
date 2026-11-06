import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { type IStaffAuthCorePort, STAFF_AUTH_CORE_PORT } from '@acme-core/contracts/staff-auth';

import {
  IAuthIdentityFindByEmailCommand,
  IAuthIdentityFindSubjectCommand,
  IAuthIdentityPort,
  IAuthIdentitySubjectView,
  IAuthIdentityUserView,
  AUTH_IDENTITY_PORT,
} from '../../outbound';

@Injectable()
export class AuthIdentityCoreAdapter implements IAuthIdentityPort {
  public static readonly provider: ClassProvider<IAuthIdentityPort> = {
    provide: AUTH_IDENTITY_PORT,
    useClass: AuthIdentityCoreAdapter,
  };

  constructor(
    @Inject(STAFF_AUTH_CORE_PORT)
    private readonly staffAuthCore: IStaffAuthCorePort,
  ) {}

  public async findSubject(
    command: IAuthIdentityFindSubjectCommand,
  ): Promise<Nullable<IAuthIdentitySubjectView>> {
    const { userId } = command;
    const subject = await this.staffAuthCore.handleFindSubject({ userId });

    return subject ? { id: subject.id, email: subject.email, roles: subject.roles } : null;
  }

  public async findByEmail(
    command: IAuthIdentityFindByEmailCommand,
  ): Promise<Nullable<IAuthIdentityUserView>> {
    const { email } = command;

    return await this.staffAuthCore.handleFindByEmail({ email });
  }
}
