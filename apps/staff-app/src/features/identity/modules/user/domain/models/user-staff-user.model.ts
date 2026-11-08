import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthEmailInvalidException } from '../exceptions/auth-email-invalid.exception';
import { AuthPasswordTooWeakException } from '../exceptions/auth-password-too-weak.exception';
import {
  IUserStaffUserCandidateInput,
  IUserStaffUserDraftOutput,
  IUserStaffUserRecordInput,
} from '../interfaces';

export class UserStaffUserModel {
  public get roles(): readonly string[] {
    return this.assignedRoles;
  }

  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    private assignedRoles: string[],
  ) {}

  public static reconstitute(record: IUserStaffUserRecordInput): UserStaffUserModel {
    const { id, userRoles } = record;
    const roles = userRoles.map((userRole) => userRole.role.name).sort();

    return new UserStaffUserModel(id, roles);
  }

  public static createDraft(candidate: IUserStaffUserCandidateInput): IUserStaffUserDraftOutput {
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

  public assignRole(role: string): boolean {
    if (this.assignedRoles.includes(role)) {
      return false;
    }

    this.assignedRoles = [...this.assignedRoles, role];

    return true;
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
