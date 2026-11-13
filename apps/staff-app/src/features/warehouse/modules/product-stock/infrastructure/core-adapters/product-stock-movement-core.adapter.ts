import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  PRODUCT_STOCK_CORE_PORT,
  ProductStockCoreMovementKindEnum,
  type IProductStockCorePort,
} from '@acme-core/contracts/product-stock';

import {
  PRODUCT_STOCK_MOVEMENT_PORT,
  type IProductStockMovementAddCommand,
  type IProductStockMovementAddView,
  type IProductStockMovementLockCommand,
  type IProductStockMovementPort,
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
    const moveView = await this.productStock.handleMove({
      kind: ProductStockCoreMovementKindEnum.ADD,
      movements: [{ productId, quantity, orderProductId: null }],
    });
    const [productStockId] = moveView.productStockIds;
    const [onHand] = moveView.stock;

    return { productStockId, quantity: onHand.quantity };
  }
}
