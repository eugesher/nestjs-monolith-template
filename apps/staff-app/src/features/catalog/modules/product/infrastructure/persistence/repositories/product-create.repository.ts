import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IProductCreateRepositoryPort,
  IProductCreateRecord,
  IProductCreateInsertQuery,
} from '../../../outbound';
import { ProductPersistenceHost } from '../host/product-persistence.host';

@Injectable()
export class ProductCreateRepository
  extends ProductPersistenceHost
  implements IProductCreateRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async existsBySku(sku: string): Promise<boolean> {
    return await this.createProductBuilder().forExistsBySku(sku).getExists();
  }

  public async insert(query: IProductCreateInsertQuery): Promise<string> {
    return await this.productRepository.insertOne(query);
  }

  public async findInserted(productId: string): Promise<IProductCreateRecord> {
    return await this.createProductBuilder().forInserted(productId).getOneOrFail();
  }
}
