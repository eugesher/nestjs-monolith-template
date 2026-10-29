import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IStaffIdentityCoreValidateSubjectRepositoryPort } from '../../../outbound';
import { StaffIdentityCoreUserBaseRepository } from './base/staff-identity-core-user-base.repository';

@Injectable()
export class StaffIdentityCoreValidateSubjectRepository
  extends StaffIdentityCoreUserBaseRepository
  implements IStaffIdentityCoreValidateSubjectRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
