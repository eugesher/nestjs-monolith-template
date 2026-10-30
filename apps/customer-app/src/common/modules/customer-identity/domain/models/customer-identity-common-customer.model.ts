import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { CustomerIdentityCommonException } from '../exceptions/customer-identity-common.exception';
import { ICustomerIdentityCommonCustomerRecord } from '../interfaces/customer-identity-common-customer-record.interface';
import { ICustomerIdentityCommonCustomerRegistration } from '../interfaces/customer-identity-common-customer-registration.interface';

export class CustomerIdentityCommonCustomerModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static register(
    registration: ICustomerIdentityCommonCustomerRegistration,
  ): CustomerIdentityCommonCustomerModel {
    const { email, passwordHash } = registration;
    const normalized = CustomerIdentityCommonCustomerModel.normalizeEmail(email);

    if (!CustomerIdentityCommonCustomerModel.EMAIL_PATTERN.test(normalized)) {
      throw new CustomerIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'Customer email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();

    return new CustomerIdentityCommonCustomerModel(
      id,
      normalized,
      passwordHash,
      UserStatusEnum.ACTIVE,
    );
  }

  public static reconstitute(
    record: ICustomerIdentityCommonCustomerRecord,
  ): CustomerIdentityCommonCustomerModel {
    const { id, email, passwordHash, status } = record;

    return new CustomerIdentityCommonCustomerModel(id, email, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < CustomerIdentityCommonCustomerModel.MIN_PASSWORD_LENGTH) {
      throw new CustomerIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${CustomerIdentityCommonCustomerModel.MIN_PASSWORD_LENGTH} characters`,
      );
    }
  }

  public get isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }

  public assertActive(): void {
    if (!this.isActive) {
      throw new CustomerIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
        `Customer ${this.id} is disabled`,
      );
    }
  }
}
