import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { AuthDomainException } from '../exceptions/auth-domain.exception';
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

  public static register(registration: IAuthCustomerRegistration): AuthCustomerModel {
    const { email, passwordHash } = registration;
    const normalized = AuthCustomerModel.normalizeEmail(email);

    if (!AuthCustomerModel.EMAIL_PATTERN.test(normalized)) {
      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'Customer email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();

    return new AuthCustomerModel(id, normalized, passwordHash, UserStatusEnum.ACTIVE);
  }

  public static reconstitute(record: IAuthCustomerRecord): AuthCustomerModel {
    const { id, email, passwordHash, status } = record;

    return new AuthCustomerModel(id, email, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < AuthCustomerModel.MIN_PASSWORD_LENGTH) {
      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${AuthCustomerModel.MIN_PASSWORD_LENGTH} characters`,
      );
    }
  }

  public assertActive(): void {
    if (this.status !== UserStatusEnum.ACTIVE) {
      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
        `Customer ${this.id} is disabled`,
      );
    }
  }
}
