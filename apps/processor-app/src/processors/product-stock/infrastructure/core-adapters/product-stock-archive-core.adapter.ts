import { Inject, Injectable } from '@nestjs/common';

import {
  type IProductCorePort,
  PRODUCT_CORE_PORT,
  ProductCoreArchiveOutcomeEnum,
} from '@acme-core/contracts/product';
import {
  IProductStockArchiveCommand,
  IProductStockArchivePort,
  IProductStockArchiveView,
} from '../../outbound';

@Injectable()
export class ProductStockArchiveCoreAdapter implements IProductStockArchivePort {
  constructor(
    @Inject(PRODUCT_CORE_PORT)
    private readonly product: IProductCorePort,
  ) {}

  public async archive(command: IProductStockArchiveCommand): Promise<IProductStockArchiveView> {
    const { productId } = command;
    const archived = await this.product.archive({ productId, expectedVersion: undefined });
    const { outcome } = archived;

    return { archived: outcome === ProductCoreArchiveOutcomeEnum.ARCHIVED };
  }
}
