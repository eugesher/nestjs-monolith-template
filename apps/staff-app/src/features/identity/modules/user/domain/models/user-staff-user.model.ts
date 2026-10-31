import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { UserDomainException } from '../exceptions/user-domain.exception';
import { IUserStaffUserRecord } from '../interfaces/user-staff-user-record.interface';
import { IUserStaffUserRegistration } from '../interfaces/user-staff-user-registration.interface';

export class UserStaffUserModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
    private assignedRoles: RoleEnum[],
  ) {}

  public static register(registration: IUserStaffUserRegistration): UserStaffUserModel {
    const { email, passwordHash, roles } = registration;
    const normalized = UserStaffUserModel.normalizeEmail(email);

    if (!UserStaffUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new UserDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'User email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();
    const unique = [...new Set(roles)];

    return new UserStaffUserModel(id, normalized, passwordHash, UserStatusEnum.ACTIVE, unique);
  }

  public static reconstitute(record: IUserStaffUserRecord): UserStaffUserModel {
    const { id, email, passwordHash, status, roles } = record;

    return new UserStaffUserModel(id, email, passwordHash, status, [...roles]);
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < UserStaffUserModel.MIN_PASSWORD_LENGTH) {
      throw new UserDomainException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${UserStaffUserModel.MIN_PASSWORD_LENGTH} characters`,
      );
    }
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public get roles(): readonly RoleEnum[] {
    return this.assignedRoles;
  }

  public assignRole(role: RoleEnum): boolean {
    if (this.assignedRoles.includes(role)) {
      return false;
    }

    this.assignedRoles = [...this.assignedRoles, role];

    return true;
  }
}
