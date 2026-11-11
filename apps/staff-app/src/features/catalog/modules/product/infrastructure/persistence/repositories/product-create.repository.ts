import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  PRODUCT_CREATE_REPOSITORY_PORT,
  ProductCreateInsertOutcomeEnum,
  type IProductCreateInsertQuery,
  type IProductCreateInsertRecord,
  type IProductCreateRecord,
  type IProductCreateRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async existsBySku(sku: string): Promise<boolean> {
    return await this.createProductBuilder().forExistsBySku(sku).getExists();
  }

  public async insert(query: IProductCreateInsertQuery): Promise<IProductCreateInsertRecord> {
    try {
      const id = await this.productRepository.insertOne(query);

      return { outcome: ProductCreateInsertOutcomeEnum.INSERTED, id };
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return { outcome: ProductCreateInsertOutcomeEnum.DUPLICATE };
      }

      throw error;
    }
  }

  public async findInserted(productId: string): Promise<IProductCreateRecord> {
    return await this.createProductBuilder().forInserted(productId).getOneOrFail();
  }
}
