import { IdentityErrorCodeEnum, UserStatusEnum } from '@acme-libs/kernel';
import { CustomerIdentityCoreException } from '../exceptions/customer-identity-core.exception';
import { ICustomerIdentityCoreCustomerRecord } from '../interfaces/customer-identity-core-customer-record.interface';

export class CustomerIdentityCoreCustomerModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatusEnum,
  ) {}

  public static reconstitute(
    record: ICustomerIdentityCoreCustomerRecord,
  ): CustomerIdentityCoreCustomerModel {
    const { id, email, passwordHash, status } = record;

    return new CustomerIdentityCoreCustomerModel(id, email, passwordHash, status);
  }

  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
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
