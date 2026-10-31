import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import {
  type IProductStockArchivePort,
  type IProductStockArchiveOutOfStockRepositoryPort,
  type IProductStockOnHandPort,
  PRODUCT_STOCK_ARCHIVE_PORT,
  PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT,
  PRODUCT_STOCK_ON_HAND_PORT,
} from '../../outbound';
import { IProductStockArchiveOutOfStockCommand } from '../interfaces';

@Injectable()
export class ProductStockArchiveOutOfStockUseCase {
  constructor(
    @Inject(PRODUCT_STOCK_ARCHIVE_OUT_OF_STOCK_REPOSITORY_PORT)
    private readonly repository: IProductStockArchiveOutOfStockRepositoryPort,
    @Inject(PRODUCT_STOCK_ON_HAND_PORT)
    private readonly onHand: IProductStockOnHandPort,
    @Inject(PRODUCT_STOCK_ARCHIVE_PORT)
    private readonly archive: IProductStockArchivePort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(ProductStockArchiveOutOfStockUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public execute(command: IProductStockArchiveOutOfStockCommand): Promise<void> {
    return this.transaction.run(() => this.archiveOutOfStock(command));
  }

  private async archiveOutOfStock(command: IProductStockArchiveOutOfStockCommand): Promise<void> {
    const { productIds } = command;
    const stock = await this.onHand.lock({ productIds });
    const outOfStock = stock.filter((row) => row.quantity <= 0).map((row) => row.productId);
    const active = await this.repository.findActive(outOfStock);

    for (const productId of active) {
      const archived = await this.archive.archive({ productId });

      if (archived.archived) {
        this.logger.info({ productId }, 'Out-of-stock product archived');
      }
    }
  }
}
