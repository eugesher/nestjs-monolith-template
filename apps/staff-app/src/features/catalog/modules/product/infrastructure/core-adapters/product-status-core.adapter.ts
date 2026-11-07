import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import {
  PRODUCT_CORE_PORT,
  ProductCoreArchiveOutcomeEnum,
  type IProductCorePort,
} from '@acme-core/contracts/product';

import {
  IProductStatusArchiveCommand,
  IProductStatusArchiveView,
  IProductStatusPort,
  PRODUCT_STATUS_PORT,
  ProductStatusArchiveOutcomeEnum,
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
    const archived = await this.product.handleArchive({ productId, expectedVersion });
    const { outcome, currentVersion } = archived;

    return { outcome: ProductStatusCoreAdapter.OUTCOMES[outcome], currentVersion };
  }
}
