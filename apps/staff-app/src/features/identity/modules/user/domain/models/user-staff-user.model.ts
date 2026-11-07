import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';

import { AuthEmailInvalidException } from '../exceptions/auth-email-invalid.exception';
import { AuthPasswordTooWeakException } from '../exceptions/auth-password-too-weak.exception';
import { IUserStaffUserCandidate } from '../interfaces/user-staff-user-candidate.interface';
import { IUserStaffUserDraft } from '../interfaces/user-staff-user-draft.interface';
import { IUserStaffUserRecord } from '../interfaces/user-staff-user-record.interface';

export class UserStaffUserModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  public get roles(): readonly RoleEnum[] {
    return this.assignedRoles;
  }

  private constructor(
    public readonly id: string,
    private assignedRoles: RoleEnum[],
  ) {}

  public static reconstitute(record: IUserStaffUserRecord): UserStaffUserModel {
    const { id, userRoles } = record;
    const roles = userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return new UserStaffUserModel(id, roles);
  }

  public static createDraft(candidate: IUserStaffUserCandidate): IUserStaffUserDraft {
    const { email, passwordHash, roles } = candidate;
    const normalized = UserStaffUserModel.normalizeEmail(email);

    if (!UserStaffUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new AuthEmailInvalidException();
    }

    const unique = [...new Set(roles)];

    return { email: normalized, passwordHash, status: UserStatusEnum.ACTIVE, roles: unique };
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < UserStaffUserModel.MIN_PASSWORD_LENGTH) {
      throw new AuthPasswordTooWeakException(UserStaffUserModel.MIN_PASSWORD_LENGTH);
    }
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public assignRole(role: RoleEnum): boolean {
    if (this.assignedRoles.includes(role)) {
      return false;
    }

    this.assignedRoles = [...this.assignedRoles, role];

    return true;
  }
}
