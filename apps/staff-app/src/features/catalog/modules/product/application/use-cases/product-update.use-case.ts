import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { PRODUCT_CATALOG_CACHE_PORT, type IProductCatalogCachePort } from '../../outbound';
import { ProductWriteService } from '../services/product-write.service';
import type { IProductUpdateCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductUpdateUseCase {
  constructor(
    private readonly writeService: ProductWriteService,
    @Inject(PRODUCT_CATALOG_CACHE_PORT)
    private readonly catalogCache: IProductCatalogCachePort,
    @InjectPinoLogger(ProductUpdateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductUpdateCommand): Promise<IProductView> {
    const { productId, name, expectedVersion } = command;
    const writeResult = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.update({ name }),
    );
    const { product } = writeResult;

    await this.catalogCache.invalidate();

    const productView = product.toSnapshot();

    this.logger.info({ productId, version: productView.version }, 'Product updated');

    return productView;
  }
}
