import { Inject, Injectable } from '@nestjs/common';

import {
  type IProductStockCorePort,
  PRODUCT_STOCK_CORE_PORT,
  ProductStockCoreMovementKindEnum,
} from '@acme-core-contracts/product-stock';

import {
  IProductStockMovementAddCommand,
  IProductStockMovementAddView,
  IProductStockMovementLockCommand,
  IProductStockMovementPort,
} from '../../outbound';

@Injectable()
export class ProductStockMovementCoreAdapter implements IProductStockMovementPort {
  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IProductStockMovementLockCommand): Promise<void> {
    const { productId } = command;

    await this.productStock.lock({ productIds: [productId] });
  }

  public async add(
    command: IProductStockMovementAddCommand,
  ): Promise<IProductStockMovementAddView> {
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
