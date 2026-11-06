import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import {
  type IProductStockCorePort,
  PRODUCT_STOCK_CORE_PORT,
  ProductStockCoreMovementKindEnum,
} from '@acme-core/contracts/product-stock';

import {
  IOrderProductStockLockCommand,
  IOrderProductStockPort,
  IOrderProductStockView,
  IOrderProductStockWithdrawCommand,
  ORDER_PRODUCT_STOCK_PORT,
} from '../../outbound';

@Injectable()
export class OrderProductStockCoreAdapter implements IOrderProductStockPort {
  public static readonly provider: ClassProvider<IOrderProductStockPort> = {
    provide: ORDER_PRODUCT_STOCK_PORT,
    useClass: OrderProductStockCoreAdapter,
  };

  private static readonly UNITS_PER_LINE = 1;

  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IOrderProductStockLockCommand): Promise<IOrderProductStockView[]> {
    const { productIds } = command;

    return await this.productStock.handleLock({ productIds });
  }

  public async withdraw(command: IOrderProductStockWithdrawCommand): Promise<void> {
    const { movements } = command;
    const lines = movements.map((movement) => ({
      productId: movement.productId,
      quantity: OrderProductStockCoreAdapter.UNITS_PER_LINE,
      orderProductId: movement.orderProductId,
    }));

    await this.productStock.handleMove({
      kind: ProductStockCoreMovementKindEnum.SUBTRACT,
      movements: lines,
    });
  }
}
