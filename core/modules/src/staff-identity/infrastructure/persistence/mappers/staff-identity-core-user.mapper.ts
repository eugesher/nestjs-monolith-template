import { StaffUser } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreUserModel } from '../../../domain';

export class StaffIdentityCoreUserMapper {
  public static toModel(user: StaffUser): StaffIdentityCoreUserModel {
    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return StaffIdentityCoreUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      roles,
    });
  }
}
