import { StaffUser } from '@acme-core/entities';
import { RoleEnum } from '@acme-libs/kernel';
import { IamStaffUserModel } from '../../../domain';

export class IamStaffUserMapper {
  public static toModel(user: StaffUser): IamStaffUserModel {
    const roles = user.userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return IamStaffUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
      roles,
    });
  }
}
