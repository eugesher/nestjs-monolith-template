import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IProductRestockRepositoryPort } from '../../../outbound';
import { ProductFindByIdBaseRepository } from './base/product-find-by-id-base.repository';

@Injectable()
export class ProductRestockRepository
  extends ProductFindByIdBaseRepository
  implements IProductRestockRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }
}
