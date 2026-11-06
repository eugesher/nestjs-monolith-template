import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import {
  type IProductCorePort,
  PRODUCT_CORE_PORT,
  ProductCoreArchiveOutcomeEnum,
} from '@acme-core/contracts/product';

import {
  IProductStockArchiveCommand,
  IProductStockArchivePort,
  IProductStockArchiveView,
  PRODUCT_STOCK_ARCHIVE_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockArchiveCoreAdapter implements IProductStockArchivePort {
  public static readonly provider: ClassProvider<IProductStockArchivePort> = {
    provide: PRODUCT_STOCK_ARCHIVE_PORT,
    useClass: ProductStockArchiveCoreAdapter,
  };

  constructor(
    @Inject(PRODUCT_CORE_PORT)
    private readonly product: IProductCorePort,
  ) {}

  public async archive(command: IProductStockArchiveCommand): Promise<IProductStockArchiveView> {
    const { productId } = command;
    const archived = await this.product.handleArchive({ productId, expectedVersion: undefined });
    const { outcome } = archived;

    return { archived: outcome === ProductCoreArchiveOutcomeEnum.ARCHIVED };
  }
}
