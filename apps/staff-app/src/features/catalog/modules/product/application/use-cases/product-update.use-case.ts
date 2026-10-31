import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type IProductCatalogCachePort, PRODUCT_CATALOG_CACHE_PORT } from '../../outbound';
import { IProductUpdateCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
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

    const view = ProductViewMapper.toView(product);

    this.logger.info({ productId, version: view.version }, 'Product updated');

    return view;
  }
}
