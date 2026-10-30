import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IStaffIdentityCommonValidateSubjectRepositoryPort } from '../../../outbound';
import { StaffIdentityCommonUserBaseRepository } from './base/staff-identity-common-user-base.repository';

@Injectable()
export class StaffIdentityCommonValidateSubjectRepository
  extends StaffIdentityCommonUserBaseRepository
  implements IStaffIdentityCommonValidateSubjectRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
