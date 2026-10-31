import { StaffUser } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { UserStaffUserModel } from '../../../domain';

export class UserStaffUserMapper {
  public static toModel(user: StaffUser): UserStaffUserModel {
    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return UserStaffUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      roles,
    });
  }
}
