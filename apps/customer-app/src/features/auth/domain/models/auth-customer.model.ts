import { UserStatusEnum } from '@acme-libs/kernel';

import { AuthEmailInvalidException } from '../exceptions/auth-email-invalid.exception';
import { AuthPasswordTooWeakException } from '../exceptions/auth-password-too-weak.exception';
import { AuthUserInactiveException } from '../exceptions/auth-user-inactive.exception';
import { IAuthCustomerDraft } from '../interfaces/auth-customer-draft.interface';
import { IAuthCustomerRecord } from '../interfaces/auth-customer-record.interface';
import { IAuthCustomerRegistration } from '../interfaces/auth-customer-registration.interface';

export class AuthCustomerModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static reconstitute(record: IAuthCustomerRecord): AuthCustomerModel {
    const { id, email, passwordHash, status } = record;

    return new AuthCustomerModel(id, email, passwordHash, status);
  }

  public static createDraft(registration: IAuthCustomerRegistration): IAuthCustomerDraft {
    const { email, passwordHash } = registration;
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
