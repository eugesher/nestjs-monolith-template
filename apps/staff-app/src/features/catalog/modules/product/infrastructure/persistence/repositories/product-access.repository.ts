import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IProductAccessRepositoryPort } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductAccessRepository
  extends ProductFindByIdBaseRepository
  implements IProductAccessRepositoryPort
{
  constructor(transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(transactionHost);
  }
}
