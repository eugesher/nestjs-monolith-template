import { Inject, Injectable } from '@nestjs/common';

import {
  type IProductCorePort,
  PRODUCT_CORE_PORT,
  ProductCoreArchiveOutcomeEnum,
} from '@acme-core/contracts/product';
import {
  IProductStatusArchiveCommand,
  IProductStatusArchiveView,
  IProductStatusPort,
} from '../../outbound';

@Injectable()
export class ProductStatusCoreAdapter implements IProductStatusPort {
  private static readonly OUTCOMES: Record<
    ProductCoreArchiveOutcomeEnum,
    IProductStatusArchiveView['outcome']
  > = {
    [ProductCoreArchiveOutcomeEnum.ARCHIVED]: 'archived',
    [ProductCoreArchiveOutcomeEnum.ALREADY_ARCHIVED]: 'already-archived',
    [ProductCoreArchiveOutcomeEnum.NOT_FOUND]: 'not-found',
    [ProductCoreArchiveOutcomeEnum.VERSION_MISMATCH]: 'version-mismatch',
  };

  constructor(
    @Inject(PRODUCT_CORE_PORT)
    private readonly product: IProductCorePort,
  ) {}

  public async archive(command: IProductStatusArchiveCommand): Promise<IProductStatusArchiveView> {
    const { productId, expectedVersion } = command;
    const archived = await this.product.archive({ productId, expectedVersion });
    const { outcome, currentVersion } = archived;

    return { outcome: ProductStatusCoreAdapter.OUTCOMES[outcome], currentVersion };
  }
}
