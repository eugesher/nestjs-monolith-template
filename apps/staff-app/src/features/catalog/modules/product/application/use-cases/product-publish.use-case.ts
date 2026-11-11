import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { ProductPublishedEvent } from '../../domain';
import {
  PRODUCT_CATALOG_CACHE_PORT,
  PRODUCT_LEDGER_PORT,
  type IProductCatalogCachePort,
  type IProductLedgerPort,
} from '../../outbound';
import { ProductWriteService } from '../services/product-write.service';
import type { IProductPublishCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductPublishUseCase {
  constructor(
    private readonly writeService: ProductWriteService,
    @Inject(PRODUCT_CATALOG_CACHE_PORT)
    private readonly catalogCache: IProductCatalogCachePort,
    @Inject(PRODUCT_LEDGER_PORT)
    private readonly ledger: IProductLedgerPort,
    @InjectPinoLogger(ProductPublishUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductPublishCommand): Promise<IProductView> {
    const { productId, expectedVersion } = command;
    const written = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.publish(),
    );
    const { product, events } = written;
    const published = events.filter((event) => event instanceof ProductPublishedEvent);

    await this.catalogCache.invalidate();
    await this.ledger.recordEvents({ events: published });

    const view = product.toSnapshot();

    this.logger.info({ productId }, 'Product published');

    return view;
  }
}
