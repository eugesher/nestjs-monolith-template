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

  public async lock(command: IProductStockCoreLockCommand): Promise<IProductStockCoreOnHandView[]> {
    return await this.productStockCoreLock.execute(command);
  }

  public async move(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView> {
    return await this.productStockCoreMove.execute(command);
  }
}
