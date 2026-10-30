import { IdentityErrorCodeEnum, RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { IamDomainException } from '../exceptions/iam-domain.exception';
import { IIamStaffUserRecord } from '../interfaces/iam-staff-user-record.interface';
import { IIamStaffUserRegistration } from '../interfaces/iam-staff-user-registration.interface';

export class IamStaffUserModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
    private assignedRoles: RoleEnum[],
  ) {}

  public static register(registration: IIamStaffUserRegistration): IamStaffUserModel {
    const { email, passwordHash, roles } = registration;
    const normalized = IamStaffUserModel.normalizeEmail(email);

    if (!IamStaffUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new IamDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'User email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();
    const unique = [...new Set(roles)];

    return new IamStaffUserModel(id, normalized, passwordHash, UserStatusEnum.ACTIVE, unique);
  }

  public static reconstitute(record: IIamStaffUserRecord): IamStaffUserModel {
    const { id, email, passwordHash, status, roles } = record;

    return new IamStaffUserModel(id, email, passwordHash, status, [...roles]);
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < IamStaffUserModel.MIN_PASSWORD_LENGTH) {
      throw new IamDomainException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${IamStaffUserModel.MIN_PASSWORD_LENGTH} characters`,
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
