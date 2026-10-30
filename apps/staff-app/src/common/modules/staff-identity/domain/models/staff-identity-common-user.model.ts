import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonException } from '../exceptions/staff-identity-common.exception';
import { IStaffIdentityCommonUserRecord } from '../interfaces/staff-identity-common-user-record.interface';
import { IStaffIdentityCommonUserRegistration } from '../interfaces/staff-identity-common-user-registration.interface';

export class StaffIdentityCommonUserModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
    private assignedRoles: RoleEnum[],
  ) {}

  public static register(
    registration: IStaffIdentityCommonUserRegistration,
  ): StaffIdentityCommonUserModel {
    const { email, passwordHash, roles } = registration;
    const normalized = StaffIdentityCommonUserModel.normalizeEmail(email);

    if (!StaffIdentityCommonUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'User email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();
    const unique = [...new Set(roles)];

    return new StaffIdentityCommonUserModel(
      id,
      normalized,
      passwordHash,
      UserStatusEnum.ACTIVE,
      unique,
    );
  }

  public static reconstitute(record: IStaffIdentityCommonUserRecord): StaffIdentityCommonUserModel {
    const { id, email, passwordHash, status, roles } = record;

    return new StaffIdentityCommonUserModel(id, email, passwordHash, status, [...roles]);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < StaffIdentityCommonUserModel.MIN_PASSWORD_LENGTH) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${StaffIdentityCommonUserModel.MIN_PASSWORD_LENGTH} characters`,
      );
    }
  }

  public get roles(): readonly RoleEnum[] {
    return this.assignedRoles;
  }

  public get isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }

  public assertActive(): void {
    if (!this.isActive) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
        `User ${this.id} is disabled`,
      );
    }
  }

  public assignRole(role: RoleEnum): boolean {
    if (this.assignedRoles.includes(role)) {
      return false;
    }

    this.assignedRoles = [...this.assignedRoles, role];

    return true;
  }
}
