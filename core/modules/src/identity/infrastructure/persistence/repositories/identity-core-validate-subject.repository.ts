import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IIdentityCoreValidateSubjectRepositoryPort } from '../../../outbound';
import { IdentityCoreUserBaseRepository } from './base/identity-core-user-base.repository';

@Injectable()
export class IdentityCoreValidateSubjectRepository
  extends IdentityCoreUserBaseRepository
  implements IIdentityCoreValidateSubjectRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
