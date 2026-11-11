import type { Nullable } from '@acme-libs/toolkit';

import { ProductPersistenceHost } from '../../host/product-persistence.host';
import type { IProductAccessRecord } from '../../../../outbound';

export abstract class ProductBaseRepository extends ProductPersistenceHost {
  public async findById(productId: string): Promise<Nullable<IProductAccessRecord>> {
    return await this.createProductBuilder().forById(productId).getOne();
  }
}
