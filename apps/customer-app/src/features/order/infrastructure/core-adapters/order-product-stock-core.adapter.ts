import { Inject, Injectable } from '@nestjs/common';

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
} from '../../outbound';

@Injectable()
export class OrderProductStockCoreAdapter implements IOrderProductStockPort {
  private static readonly UNITS_PER_LINE = 1;

  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IOrderProductStockLockCommand): Promise<IOrderProductStockView[]> {
    const { productIds } = command;

    return await this.productStock.lock({ productIds });
  }

  public async withdraw(command: IOrderProductStockWithdrawCommand): Promise<void> {
    const { movements } = command;
    const lines = movements.map((movement) => ({
      productId: movement.productId,
      quantity: OrderProductStockCoreAdapter.UNITS_PER_LINE,
      orderProductId: movement.orderProductId,
    }));

    await this.productStock.move({
      kind: ProductStockCoreMovementKindEnum.SUBTRACT,
      movements: lines,
    });
  }
}
