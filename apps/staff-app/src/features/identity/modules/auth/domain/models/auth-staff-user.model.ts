import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { AuthDomainException } from '../exceptions/auth-domain.exception';
import { IAuthStaffUserRecord } from '../interfaces/auth-staff-user-record.interface';

export class AuthStaffUserModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static reconstitute(record: IAuthStaffUserRecord): AuthStaffUserModel {
    const { id, email, passwordHash, status } = record;

    return new AuthStaffUserModel(id, email, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public assertActive(): void {
    if (this.status !== UserStatusEnum.ACTIVE) {
      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
        `User ${this.id} is disabled`,
      );
    }
  }
}
