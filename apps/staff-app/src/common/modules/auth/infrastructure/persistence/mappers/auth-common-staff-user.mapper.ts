import { StaffUser } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { AuthCommonStaffUserModel } from '../../../domain';

export class AuthCommonStaffUserMapper {
  public static toModel(user: StaffUser): AuthCommonStaffUserModel {
    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return AuthCommonStaffUserModel.reconstitute({
      id: user.id,
      email: user.email,
      status: user.status,
      roles,
    });
  }
}
