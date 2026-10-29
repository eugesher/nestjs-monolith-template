import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerIdentityCoreSubjectView,
  ICustomerIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/customer-identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  CUSTOMER_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type ICustomerIdentityCoreValidateSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class CustomerIdentityCoreValidateSubjectUseCase {
  constructor(
    @Inject(CUSTOMER_IDENTITY_CORE_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: ICustomerIdentityCoreValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: ICustomerIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCoreSubjectView>> {
    const { customerId } = query;
    const customer = await this.repository.findById(customerId);

    if (!customer?.isActive) {
      return undefined;
    }

    return { id: customer.id, email: customer.email };
  }
}
