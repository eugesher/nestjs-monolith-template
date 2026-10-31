import { Inject, Injectable } from '@nestjs/common';

import { ProductDomainException, ProductErrorCodeEnum } from '../../domain';
import { type IProductStatusPort, PRODUCT_STATUS_PORT } from '../../outbound';
import { IProductArchiveCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
import { ProductAccessService } from '../services/product-access.service';

@Injectable()
export class ProductArchiveUseCase {
  constructor(
    private readonly accessService: ProductAccessService,
    @Inject(PRODUCT_STATUS_PORT)
    private readonly status: IProductStatusPort,
  ) {}

  public async execute(command: IProductArchiveCommand): Promise<IProductView> {
    const { productId, expectedVersion } = command;
    const archived = await this.status.archive({ productId, expectedVersion });
    const { outcome, currentVersion } = archived;

    if (outcome === 'not-found') {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_NOT_FOUND,
        `Product ${productId} was not found`,
      );
    }

    if (outcome === 'version-mismatch') {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_VERSION_MISMATCH,
        `Product ${productId}: If-Match version ${String(expectedVersion)} does not match the current version ${String(currentVersion)}`,
        { currentVersion },
      );
    }

    if (outcome === 'already-archived') {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_ALREADY_ARCHIVED,
        `Product ${productId} is already archived`,
      );
    }

    const product = await this.accessService.load({ productId });

    return ProductViewMapper.toView(product);
  }
}
