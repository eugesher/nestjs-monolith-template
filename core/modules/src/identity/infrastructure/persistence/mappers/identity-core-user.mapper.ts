import { User } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { IdentityCoreUserModel } from '../../../domain';

export class IdentityCoreUserMapper {
  public static toModel(user: User): IdentityCoreUserModel {
    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return IdentityCoreUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      roles,
    });
  }
}
