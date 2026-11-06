import { Nullable } from '@acme-libs/toolkit';

import { IProductAccessRecord } from '../../../../outbound';
import { ProductPersistenceHost } from '../../host/product-persistence.host';

export abstract class ProductBaseRepository extends ProductPersistenceHost {
  public async findById(productId: string): Promise<Nullable<IProductAccessRecord>> {
    return await this.createProductBuilder().forById(productId).getOne();
  }
}
