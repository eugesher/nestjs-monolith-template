import { Nullable } from '@acme-libs/toolkit';
import { ProductStockCoreMovementKindEnum } from '../../enums/product-stock-core-movement-kind.enum';

export interface IProductStockCoreMoveCommand {
  kind: ProductStockCoreMovementKindEnum;
  movements: { productId: string; quantity: number; orderProductId: Nullable<string> }[];
}
