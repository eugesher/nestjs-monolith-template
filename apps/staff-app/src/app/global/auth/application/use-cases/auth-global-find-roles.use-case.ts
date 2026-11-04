import { Inject, Injectable } from '@nestjs/common';

import { RoleEnum } from '@acme-libs/kernel';

import { AUTH_GLOBAL_SUBJECT_PORT, type IAuthGlobalSubjectPort } from '../../outbound';
import { IAuthGlobalFindRolesCommand } from '../interfaces';

@Injectable()
export class AuthGlobalFindRolesUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_SUBJECT_PORT)
    private readonly subject: IAuthGlobalSubjectPort,
  ) {}

  public async execute(command: IAuthGlobalFindRolesCommand): Promise<RoleEnum[]> {
    const { userId } = command;
    const user = await this.subject.findSubject(userId);

    return user?.roles ?? [];
  }
}
