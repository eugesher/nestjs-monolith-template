import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type IProductEventsPort, PRODUCT_EVENTS_PORT } from '../../outbound';
import { IProductArchiveCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
import { ProductLedgerService } from '../services/product-ledger.service';
import { ProductWriteService } from '../services/product-write.service';

@Injectable()
export class ProductArchiveUseCase {
  constructor(
    private readonly writeService: ProductWriteService,
    private readonly ledgerService: ProductLedgerService,
    @Inject(PRODUCT_EVENTS_PORT)
    private readonly events: IProductEventsPort,
    @InjectPinoLogger(ProductArchiveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductArchiveCommand): Promise<IProductView> {
    const { productId, expectedVersion } = command;
    const written = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.archive(),
    );
    const { product, events } = written;

    await this.events.publish({ productId, events });
    await this.ledgerService.recordArchived({ productId, events });

    const view = ProductViewMapper.toView(product);

    this.logger.info({ productId }, 'Product archived');

    return view;
  }
}
