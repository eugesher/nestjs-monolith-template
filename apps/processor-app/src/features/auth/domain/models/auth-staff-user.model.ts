import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthUserInactiveException } from '../exceptions/auth-user-inactive.exception';
import { IAuthStaffUserRecordInput } from '../interfaces';

export class AuthStaffUserModel {
  private constructor(
    public readonly id: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static reconstitute(record: IAuthStaffUserRecordInput): AuthStaffUserModel {
    const { id, passwordHash, status } = record;

    return new AuthStaffUserModel(id, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public assertActive(): void {
    if (this.status !== UserStatusEnum.ACTIVE) {
      throw new AuthUserInactiveException(this.id);
    }
  }
}
