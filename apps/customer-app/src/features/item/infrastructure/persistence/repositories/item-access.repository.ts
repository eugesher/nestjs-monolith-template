import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IItemAccessRepositoryPort } from '../../../outbound';
import { ItemFindByIdBaseRepository } from './base/item-find-by-id-base.repository';

@Injectable()
export class ItemAccessRepository
  extends ItemFindByIdBaseRepository
  implements IItemAccessRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
