import type { Nullable } from '@acme-libs/toolkit';

import type { ProductStockCoreMovementKindEnum } from '../../enums/product-stock-core-movement-kind.enum';

export interface IProductStockCoreMoveCommand {
  kind: ProductStockCoreMovementKindEnum;
  movements: {
    productId: string;
    quantity: number;
    orderProductId: Nullable<string>;
  }[];
}
