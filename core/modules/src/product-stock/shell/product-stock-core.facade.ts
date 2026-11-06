import { Injectable } from '@nestjs/common';

import {
  IProductStockCoreLockCommand,
  IProductStockCoreMoveCommand,
  IProductStockCoreMoveView,
  IProductStockCoreOnHandView,
  IProductStockCorePort,
} from '@acme-core/contracts/product-stock';

import { ProductStockCoreLockUseCase, ProductStockCoreMoveUseCase } from '../application';

@Injectable()
export class ProductStockCoreFacade implements IProductStockCorePort {
  constructor(
    private readonly lock: ProductStockCoreLockUseCase,
    private readonly move: ProductStockCoreMoveUseCase,
  ) {}

  public async handleLock(
    command: IProductStockCoreLockCommand,
  ): Promise<IProductStockCoreOnHandView[]> {
    return await this.lock.execute(command);
  }

  public async handleMove(
    command: IProductStockCoreMoveCommand,
  ): Promise<IProductStockCoreMoveView> {
    return await this.move.execute(command);
  }
}
