import { Product } from '@acme-core/entities';

import { ProductCreateInsertOutcomeEnum } from '../../enums/product-create-insert-outcome.enum';

export type IProductCreateRecord = Pick<
  Product,
  'id' | 'sku' | 'name' | 'status' | 'version' | 'createdAt' | 'updatedAt'
>;

export type IProductCreateInsertRecord =
  | (Pick<Product, 'id'> & { outcome: ProductCreateInsertOutcomeEnum.INSERTED })
  | { outcome: ProductCreateInsertOutcomeEnum.DUPLICATE };
