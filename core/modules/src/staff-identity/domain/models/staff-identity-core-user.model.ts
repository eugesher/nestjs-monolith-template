import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreException } from '../exceptions/staff-identity-core.exception';
import { IStaffIdentityCoreUserRecord } from '../interfaces/staff-identity-core-user-record.interface';
import { IStaffIdentityCoreUserRegistration } from '../interfaces/staff-identity-core-user-registration.interface';

export class StaffIdentityCoreUserModel {
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
    registration: IStaffIdentityCoreUserRegistration,
  ): StaffIdentityCoreUserModel {
    const { email, passwordHash, roles } = registration;
    const normalized = StaffIdentityCoreUserModel.normalizeEmail(email);

    if (!StaffIdentityCoreUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'User email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();
    const unique = [...new Set(roles)];

    return new StaffIdentityCoreUserModel(
      id,
      normalized,
      passwordHash,
      UserStatusEnum.ACTIVE,
      unique,
    );
  }

  public static reconstitute(record: IStaffIdentityCoreUserRecord): StaffIdentityCoreUserModel {
    const { id, email, passwordHash, status, roles } = record;

    return new StaffIdentityCoreUserModel(id, email, passwordHash, status, [...roles]);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < StaffIdentityCoreUserModel.MIN_PASSWORD_LENGTH) {
      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${StaffIdentityCoreUserModel.MIN_PASSWORD_LENGTH} characters`,
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
      throw new StaffIdentityCoreException(
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
