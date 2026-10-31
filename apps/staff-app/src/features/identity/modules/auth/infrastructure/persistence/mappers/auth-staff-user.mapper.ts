import { StaffUser } from '@acme-core/entities';
import { AuthStaffUserModel } from '../../../domain';

export class AuthStaffUserMapper {
  public static toModel(user: StaffUser): AuthStaffUserModel {
    return AuthStaffUserModel.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status,
    });
  }
}
