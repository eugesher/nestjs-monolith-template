import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IIdentityCoreRefreshTokenRepositoryPort } from '../../../outbound';
import { IdentityCoreUserBaseRepository } from './base/identity-core-user-base.repository';

@Injectable()
export class IdentityCoreRefreshTokenRepository
  extends IdentityCoreUserBaseRepository
  implements IIdentityCoreRefreshTokenRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
