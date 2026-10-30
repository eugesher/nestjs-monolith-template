import { Customer } from '@acme-core/entities';
import { AuthCustomerModel } from '../../../domain';

export class AuthCustomerMapper {
  public static toModel(customer: Customer): AuthCustomerModel {
    return AuthCustomerModel.reconstitute({
      id: customer.id,
      email: customer.email,
      passwordHash: customer.passwordHash,
      status: customer.status,
    });
  }
}
