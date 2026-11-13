import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  PRODUCT_CORE_PORT,
  ProductCoreArchiveOutcomeEnum,
  type IProductCorePort,
} from '@acme-core/contracts/product';

import {
  PRODUCT_STOCK_ARCHIVE_PORT,
  type IProductStockArchiveCommand,
  type IProductStockArchivePort,
  type IProductStockArchiveView,
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
    const archiveResult = await this.product.handleArchive({
      productId,
      expectedVersion: undefined,
    });
    const { outcome } = archiveResult;

    return { archived: outcome === ProductCoreArchiveOutcomeEnum.ARCHIVED };
  }
}
