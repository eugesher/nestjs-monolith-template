import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type ICustomerIdentityCommonValidateSubjectRepositoryPort } from '../../../outbound';
import { CustomerIdentityCommonCustomerBaseRepository } from './base/customer-identity-common-customer-base.repository';

@Injectable()
export class CustomerIdentityCommonValidateSubjectRepository
  extends CustomerIdentityCommonCustomerBaseRepository
  implements ICustomerIdentityCommonValidateSubjectRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
