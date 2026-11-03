import { Nullable } from '@acme-libs/toolkit';

import { ProductStockCoreMovementKindEnum } from '../../enums/product-stock-core-movement-kind.enum';

interface IProductStockCoreMoveCommandMovement {
  productId: string;
  quantity: number;
  orderProductId: Nullable<string>;
}

export interface IProductStockCoreMoveCommand {
  kind: ProductStockCoreMovementKindEnum;
  movements: IProductStockCoreMoveCommandMovement[];
}
