import { Inject, Injectable } from '@nestjs/common';

import {
  ICustomerIdentityCommonSubjectView,
  ICustomerIdentityCommonValidateSubjectQuery,
} from '@acme-customer-contracts/customer-identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  CUSTOMER_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT,
  type ICustomerIdentityCommonValidateSubjectRepositoryPort,
} from '../../outbound';

@Injectable()
export class CustomerIdentityCommonValidateSubjectUseCase {
  constructor(
    @Inject(CUSTOMER_IDENTITY_COMMON_VALIDATE_SUBJECT_REPOSITORY_PORT)
    private readonly repository: ICustomerIdentityCommonValidateSubjectRepositoryPort,
  ) {}

  public async execute(
    query: ICustomerIdentityCommonValidateSubjectQuery,
  ): Promise<Maybe<ICustomerIdentityCommonSubjectView>> {
    const { customerId } = query;
    const customer = await this.repository.findById(customerId);

    if (!customer?.isActive) {
      return undefined;
    }

    return { id: customer.id, email: customer.email };
  }
}
