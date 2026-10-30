import { Customer } from '@acme-core/entities';
import { CustomerIdentityCommonCustomerModel } from '../../../domain';

export class CustomerIdentityCommonCustomerMapper {
  public static toModel(customer: Customer): CustomerIdentityCommonCustomerModel {
    return CustomerIdentityCommonCustomerModel.reconstitute({
      id: customer.id,
      email: customer.email,
      passwordHash: customer.passwordHash,
      status: customer.status,
    });
  }
}
