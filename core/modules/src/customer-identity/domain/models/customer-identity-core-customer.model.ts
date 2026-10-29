import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { CustomerIdentityCoreException } from '../exceptions/customer-identity-core.exception';
import { ICustomerIdentityCoreCustomerRecord } from '../interfaces/customer-identity-core-customer-record.interface';
import { ICustomerIdentityCoreCustomerRegistration } from '../interfaces/customer-identity-core-customer-registration.interface';

export class CustomerIdentityCoreCustomerModel {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 12;

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static register(
    registration: ICustomerIdentityCoreCustomerRegistration,
  ): CustomerIdentityCoreCustomerModel {
    const { email, passwordHash } = registration;
    const normalized = CustomerIdentityCoreCustomerModel.normalizeEmail(email);

    if (!CustomerIdentityCoreCustomerModel.EMAIL_PATTERN.test(normalized)) {
      throw new CustomerIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_INVALID,
        'Customer email must be a well-formed address',
      );
    }

    const id = crypto.randomUUID();

    return new CustomerIdentityCoreCustomerModel(
      id,
      normalized,
      passwordHash,
      UserStatusEnum.ACTIVE,
    );
  }

  public static reconstitute(
    record: ICustomerIdentityCoreCustomerRecord,
  ): CustomerIdentityCoreCustomerModel {
    const { id, email, passwordHash, status } = record;

    return new CustomerIdentityCoreCustomerModel(id, email, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  public static assertPasswordStrength(password: string): void {
    if (password.length < CustomerIdentityCoreCustomerModel.MIN_PASSWORD_LENGTH) {
      throw new CustomerIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK,
        `Password must be at least ${CustomerIdentityCoreCustomerModel.MIN_PASSWORD_LENGTH} characters`,
      );
    }
  }

  public get isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }

  public assertActive(): void {
    if (!this.isActive) {
      throw new CustomerIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_USER_INACTIVE,
        `Customer ${this.id} is disabled`,
      );
    }
  }
}
