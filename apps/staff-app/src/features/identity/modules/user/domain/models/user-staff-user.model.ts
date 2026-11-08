import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthEmailInvalidException } from '../exceptions/auth-email-invalid.exception';
import { AuthPasswordTooWeakException } from '../exceptions/auth-password-too-weak.exception';
import { IUserStaffUserCandidateInput, IUserStaffUserDraftOutput } from '../interfaces';

export class UserStaffUserModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  public static createDraft(candidate: IUserStaffUserCandidateInput): IUserStaffUserDraftOutput {
    const { email, passwordHash, roleIds } = candidate;
    const normalized = UserStaffUserModel.normalizeEmail(email);

    if (!UserStaffUserModel.EMAIL_PATTERN.test(normalized)) {
      throw new AuthEmailInvalidException();
    }

    const unique = [...new Set(roleIds)];

    return { email: normalized, passwordHash, status: UserStatusEnum.ACTIVE, roleIds: unique };
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < UserStaffUserModel.MIN_PASSWORD_LENGTH) {
      throw new AuthPasswordTooWeakException(UserStaffUserModel.MIN_PASSWORD_LENGTH);
    }
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
