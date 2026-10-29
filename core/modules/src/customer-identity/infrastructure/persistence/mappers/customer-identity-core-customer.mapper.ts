import { Customer } from '@acme-core/entities';
import { CustomerIdentityCoreCustomerModel } from '../../../domain';

export class CustomerIdentityCoreCustomerMapper {
  public static toModel(customer: Customer): CustomerIdentityCoreCustomerModel {
    return CustomerIdentityCoreCustomerModel.reconstitute({
      id: customer.id,
      email: customer.email,
      passwordHash: customer.passwordHash,
      status: customer.status,
    });
  }
}
