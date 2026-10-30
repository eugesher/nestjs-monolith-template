import { StaffUser } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonUserModel } from '../../../domain';

export class StaffIdentityCommonUserMapper {
  public static toModel(user: StaffUser): StaffIdentityCommonUserModel {
    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return StaffIdentityCommonUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      roles,
    });
  }
}
