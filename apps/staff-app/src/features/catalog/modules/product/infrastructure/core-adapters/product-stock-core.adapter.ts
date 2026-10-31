import { Inject, Injectable } from '@nestjs/common';

import {
  type IProductStockCorePort,
  PRODUCT_STOCK_CORE_PORT,
  ProductStockCoreMovementKindEnum,
} from '@acme-core/contracts/product-stock';
import {
  IProductStockLockCommand,
  IProductStockPort,
  IProductStockRestockCommand,
  IProductStockRestockView,
} from '../../outbound';

@Injectable()
export class ProductStockCoreAdapter implements IProductStockPort {
  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IProductStockLockCommand): Promise<void> {
    const { productId } = command;

    await this.productStock.lock({ productIds: [productId] });
  }

  public async restock(command: IProductStockRestockCommand): Promise<IProductStockRestockView> {
    const { productId, quantity } = command;
    const moved = await this.productStock.move({
      kind: ProductStockCoreMovementKindEnum.ADD,
      movements: [{ productId, quantity, orderProductId: null }],
    });
    const [productStockId] = moved.productStockIds;
    const [onHand] = moved.stock;

    return { productStockId, quantity: onHand.quantity };
  }
}
