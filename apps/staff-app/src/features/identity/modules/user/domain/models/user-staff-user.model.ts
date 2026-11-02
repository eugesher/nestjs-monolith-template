import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

import { AuthEmailInvalidException } from '../exceptions/auth-email-invalid.exception';
import { AuthPasswordTooWeakException } from '../exceptions/auth-password-too-weak.exception';
import { IUserStaffUserDraft } from '../interfaces/user-staff-user-draft.interface';
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

  public static register(registration: IUserStaffUserRegistration): IUserStaffUserDraft {
    const { email, passwordHash, roles } = registration;
    const normalized = UserStaffUserModel.normalizeEmail(email);

    if (!UserStaffUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new AuthEmailInvalidException();
    }

    const unique = [...new Set(roles)];

    return { email: normalized, passwordHash, status: UserStatusEnum.ACTIVE, roles: unique };
  }

  public static reconstitute(record: IUserStaffUserRecord): UserStaffUserModel {
    const { id, email, passwordHash, status, roles } = record;

    return new UserStaffUserModel(id, email, passwordHash, status, [...roles]);
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < UserStaffUserModel.MIN_PASSWORD_LENGTH) {
      throw new AuthPasswordTooWeakException(UserStaffUserModel.MIN_PASSWORD_LENGTH);
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
