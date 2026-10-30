import { Inject, Injectable } from '@nestjs/common';

import {
  IProductStockCoreMoveCommand,
  IProductStockCoreMoveView,
  ProductStockCoreMovementKindEnum,
} from '@acme-core/contracts/product-stock';
import {
  type IProductStockCoreMoveRepositoryPort,
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockCoreMoveUseCase {
  private static readonly SIGNS: Record<ProductStockCoreMovementKindEnum, number> = {
    [ProductStockCoreMovementKindEnum.ADD]: 1,
    [ProductStockCoreMovementKindEnum.SUBTRACT]: -1,
  };

  constructor(
    @Inject(PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT)
    private readonly repository: IProductStockCoreMoveRepositoryPort,
  ) {}

  public async execute(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView> {
    const { kind, movements } = command;
    const sign = ProductStockCoreMoveUseCase.SIGNS[kind];
    const productIds = [...new Set(movements.map((movement) => movement.productId))];
    const rows = movements.map((movement) => ({
      productId: movement.productId,
      quantity: sign * movement.quantity,
      orderProductId: movement.orderProductId,
    }));

    await this.repository.lockProducts(productIds);

    const productStockIds = await this.repository.insertMany(rows);
    const stock = await this.repository.sumStock(productIds);

    return { productStockIds, stock };
  }
}
