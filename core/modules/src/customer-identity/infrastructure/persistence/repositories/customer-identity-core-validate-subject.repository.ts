import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type ICustomerIdentityCoreValidateSubjectRepositoryPort } from '../../../outbound';
import { CustomerIdentityCoreCustomerBaseRepository } from './base/customer-identity-core-customer-base.repository';

@Injectable()
export class CustomerIdentityCoreValidateSubjectRepository
  extends CustomerIdentityCoreCustomerBaseRepository
  implements ICustomerIdentityCoreValidateSubjectRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
