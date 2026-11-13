import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  PRODUCT_CORE_PORT,
  ProductCoreArchiveOutcomeEnum,
  type IProductCorePort,
} from '@acme-core/contracts/product';

import {
  PRODUCT_STATUS_PORT,
  ProductStatusArchiveOutcomeEnum,
  type IProductStatusArchiveCommand,
  type IProductStatusArchiveView,
  type IProductStatusPort,
} from '../../outbound';

@Injectable()
export class ProductStatusCoreAdapter implements IProductStatusPort {
  public static readonly provider: ClassProvider<IProductStatusPort> = {
    provide: PRODUCT_STATUS_PORT,
    useClass: ProductStatusCoreAdapter,
  };

  private static readonly OUTCOMES: Record<
    ProductCoreArchiveOutcomeEnum,
    IProductStatusArchiveView['outcome']
  > = {
    [ProductCoreArchiveOutcomeEnum.ARCHIVED]: ProductStatusArchiveOutcomeEnum.ARCHIVED,
    [ProductCoreArchiveOutcomeEnum.ALREADY_ARCHIVED]:
      ProductStatusArchiveOutcomeEnum.ALREADY_ARCHIVED,
    [ProductCoreArchiveOutcomeEnum.NOT_FOUND]: ProductStatusArchiveOutcomeEnum.NOT_FOUND,
    [ProductCoreArchiveOutcomeEnum.VERSION_MISMATCH]:
      ProductStatusArchiveOutcomeEnum.VERSION_MISMATCH,
  };

  constructor(
    @Inject(PRODUCT_CORE_PORT)
    private readonly product: IProductCorePort,
  ) {}

  public async archive(command: IProductStatusArchiveCommand): Promise<IProductStatusArchiveView> {
    const { productId, expectedVersion } = command;
    const archiveView = await this.product.handleArchive({ productId, expectedVersion });
    const { outcome, currentVersion } = archiveView;

    return { outcome: ProductStatusCoreAdapter.OUTCOMES[outcome], currentVersion };
  }
}
