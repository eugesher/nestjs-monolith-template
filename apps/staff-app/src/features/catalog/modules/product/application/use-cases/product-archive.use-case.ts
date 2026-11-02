import { Inject, Injectable } from '@nestjs/common';

import {
  ProductAlreadyArchivedException,
  ProductNotFoundException,
  ProductVersionMismatchException,
} from '../../domain';
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
      throw new ProductNotFoundException(productId);
    }

    if (outcome === 'version-mismatch') {
      throw new ProductVersionMismatchException(
        productId,
        currentVersion,
        `Product ${productId}: If-Match version ${String(expectedVersion)} does not match the current version ${String(currentVersion)}`,
      );
    }

    if (outcome === 'already-archived') {
      throw new ProductAlreadyArchivedException(productId);
    }

    const product = await this.accessService.load({ productId });

    return ProductViewMapper.toView(product);
  }
}
