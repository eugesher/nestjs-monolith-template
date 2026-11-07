import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IProductCreateInsertQuery,
  IProductCreateRecord,
  IProductCreateRepositoryPort,
  PRODUCT_CREATE_REPOSITORY_PORT,
} from '../../../outbound';
import { ProductPersistenceHost } from '../host/product-persistence.host';

@Injectable()
export class ProductCreateRepository
  extends ProductPersistenceHost
  implements IProductCreateRepositoryPort
{
  public static readonly provider: ClassProvider<IProductCreateRepositoryPort> = {
    provide: PRODUCT_CREATE_REPOSITORY_PORT,
    useClass: ProductCreateRepository,
  };

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
