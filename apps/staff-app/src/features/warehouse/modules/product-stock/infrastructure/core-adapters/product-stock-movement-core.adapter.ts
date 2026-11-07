import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import {
  PRODUCT_STOCK_CORE_PORT,
  ProductStockCoreMovementKindEnum,
  type IProductStockCorePort,
} from '@acme-core/contracts/product-stock';

import {
  IProductStockMovementAddCommand,
  IProductStockMovementAddView,
  IProductStockMovementLockCommand,
  IProductStockMovementPort,
  PRODUCT_STOCK_MOVEMENT_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockMovementCoreAdapter implements IProductStockMovementPort {
  public static readonly provider: ClassProvider<IProductStockMovementPort> = {
    provide: PRODUCT_STOCK_MOVEMENT_PORT,
    useClass: ProductStockMovementCoreAdapter,
  };

  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IProductStockMovementLockCommand): Promise<void> {
    const { productId } = command;

    await this.productStock.handleLock({ productIds: [productId] });
  }

  public async add(
    command: IProductStockMovementAddCommand,
  ): Promise<IProductStockMovementAddView> {
    const { productId, quantity } = command;
    const moved = await this.productStock.handleMove({
      kind: ProductStockCoreMovementKindEnum.ADD,
      movements: [{ productId, quantity, orderProductId: null }],
    });
    const [productStockId] = moved.productStockIds;
    const [onHand] = moved.stock;

    return { productStockId, quantity: onHand.quantity };
  }
}
