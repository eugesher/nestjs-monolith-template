import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PRODUCT_CATALOG_CACHE_PORT, type IProductCatalogCachePort } from '../../outbound';
import { IProductUpdateCommand, IProductView } from '../interfaces';
import { ProductWriteService } from '../services/product-write.service';

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
    const written = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.update({ name }),
    );
    const { product } = written;

    await this.catalogCache.invalidate();

    const view = product.toSnapshot();

    this.logger.info({ productId, version: view.version }, 'Product updated');

    return view;
  }
}
