import { Inject, Injectable } from '@nestjs/common';

import { IAM_LIST_ROLES_REPOSITORY_PORT, type IIamListRolesRepositoryPort } from '../../outbound';
import { IIamRoleView } from '../interfaces';
import { IamRoleViewMapper } from '../mappers/iam-role-view.mapper';

@Injectable()
export class IamListRolesUseCase {
  constructor(
    @Inject(IAM_LIST_ROLES_REPOSITORY_PORT)
    private readonly repository: IIamListRolesRepositoryPort,
  ) {}

  public async execute(): Promise<IIamRoleView[]> {
    const roles = await this.repository.list();

    return roles.map((role) => IamRoleViewMapper.toView(role));
  }
}
