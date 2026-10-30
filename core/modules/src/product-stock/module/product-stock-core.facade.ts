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
    private readonly productStockCoreLock: ProductStockCoreLockUseCase,
    private readonly productStockCoreMove: ProductStockCoreMoveUseCase,
  ) {}

  public lock(command: IProductStockCoreLockCommand): Promise<IProductStockCoreOnHandView[]> {
    return this.productStockCoreLock.execute(command);
  }

  public move(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView> {
    return this.productStockCoreMove.execute(command);
  }
}
