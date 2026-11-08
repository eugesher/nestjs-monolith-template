import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthEmailInvalidException } from '../exceptions/auth-email-invalid.exception';
import { AuthPasswordTooWeakException } from '../exceptions/auth-password-too-weak.exception';
import { AuthUserInactiveException } from '../exceptions/auth-user-inactive.exception';
import { IAuthCustomerCandidateInput } from '../interfaces/inputs/auth-customer-candidate.input';
import { IAuthCustomerRecordInput } from '../interfaces/inputs/auth-customer-record.input';
import { IAuthCustomerDraftOutput } from '../interfaces/outputs/auth-customer-draft.output';

export class AuthCustomerModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static reconstitute(record: IAuthCustomerRecordInput): AuthCustomerModel {
    const { id, passwordHash, status } = record;

    return new AuthCustomerModel(id, passwordHash, status);
  }

  public static createDraft(candidate: IAuthCustomerCandidateInput): IAuthCustomerDraftOutput {
    const { email, passwordHash } = candidate;
    const normalized = AuthCustomerModel.normalizeEmail(email);

    if (!AuthCustomerModel.EMAIL_PATTERN.test(normalized)) {
      throw new AuthEmailInvalidException();
    }

    return { email: normalized, passwordHash, status: UserStatusEnum.ACTIVE };
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < AuthCustomerModel.MIN_PASSWORD_LENGTH) {
      throw new AuthPasswordTooWeakException(AuthCustomerModel.MIN_PASSWORD_LENGTH);
    }
  }

  public assertActive(): void {
    if (this.status !== UserStatusEnum.ACTIVE) {
      throw new AuthUserInactiveException(this.id);
    }
  }
}
