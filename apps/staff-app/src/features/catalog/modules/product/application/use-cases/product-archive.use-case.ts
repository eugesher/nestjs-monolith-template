import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IProductArchiveCommand, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
import { ProductLedgerService } from '../services/product-ledger.service';
import { ProductWriteService } from '../services/product-write.service';

@Injectable()
export class ProductArchiveUseCase {
  constructor(
    private readonly writeService: ProductWriteService,
    private readonly ledgerService: ProductLedgerService,
    @InjectPinoLogger(ProductArchiveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductArchiveCommand): Promise<IProductView> {
    const { productId, expectedVersion } = command;
    const written = await this.writeService.write({ productId, expectedVersion }, (product) =>
      product.archive(),
    );
    const { product, events } = written;

    await this.ledgerService.enqueue({ productId, events });
    await this.ledgerService.recordArchived({ productId, events });

    const view = ProductViewMapper.toView(product);

    this.logger.info({ productId }, 'Product archived');

    return view;
  }
}
