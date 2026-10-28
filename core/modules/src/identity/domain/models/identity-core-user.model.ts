import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { IdentityCoreException } from '../exceptions/identity-core.exception';
import { IIdentityCoreUserRecord } from '../interfaces/identity-core-user-record.interface';
import { IIdentityCoreUserRegistration } from '../interfaces/identity-core-user-registration.interface';

export class IdentityCoreUserModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
    private assignedRoles: RoleEnum[],
  ) {}

  public static register(registration: IIdentityCoreUserRegistration): IdentityCoreUserModel {
    const { email, passwordHash, roles } = registration;
    const normalized = IdentityCoreUserModel.normalizeEmail(email);

    if (!IdentityCoreUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'User email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();
    const unique = [...new Set(roles)];

    return new IdentityCoreUserModel(id, normalized, passwordHash, UserStatusEnum.ACTIVE, unique);
  }

  public static reconstitute(record: IIdentityCoreUserRecord): IdentityCoreUserModel {
    const { id, email, passwordHash, status, roles } = record;

    return new IdentityCoreUserModel(id, email, passwordHash, status, [...roles]);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < IdentityCoreUserModel.MIN_PASSWORD_LENGTH) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${IdentityCoreUserModel.MIN_PASSWORD_LENGTH} characters`,
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
      throw new IdentityCoreException(
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
