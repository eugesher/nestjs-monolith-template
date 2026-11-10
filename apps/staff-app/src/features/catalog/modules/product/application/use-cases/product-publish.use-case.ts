import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PRODUCT_CATALOG_CACHE_PORT, type IProductCatalogCachePort } from '../../outbound';
import { IProductPublishCommand, IProductView } from '../interfaces';
import { ProductLedgerService } from '../services/product-ledger.service';
import { ProductWriteService } from '../services/product-write.service';

@Injectable()
export class ProductPublishUseCase {
  constructor(
    private readonly writeService: ProductWriteService,
    private readonly ledgerService: ProductLedgerService,
    @Inject(PRODUCT_CATALOG_CACHE_PORT)
    private readonly catalogCache: IProductCatalogCachePort,
    @InjectPinoLogger(ProductPublishUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductPublishCommand): Promise<IProductView> {
    const { productId, expectedVersion } = command;
    const written = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.publish(),
    );
    const { product, events } = written;

    await this.catalogCache.invalidate();
    await this.ledgerService.recordEvents({ events });

    const view = product.toSnapshot();

    this.logger.info({ productId }, 'Product published');

    return view;
  }
}
