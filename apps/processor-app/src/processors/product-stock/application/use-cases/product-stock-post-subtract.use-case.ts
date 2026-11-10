import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  PRODUCT_STOCK_ARCHIVE_PORT,
  PRODUCT_STOCK_ON_HAND_PORT,
  PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT,
  PRODUCT_STOCK_TRANSACTION_PORT,
  type IProductStockArchivePort,
  type IProductStockOnHandPort,
  type IProductStockPostSubtractRepositoryPort,
  type IProductStockTransactionPort,
} from '../../outbound';
import { IProductStockPostSubtractCommand } from '../interfaces';

@Injectable()
export class ProductStockPostSubtractUseCase {
  constructor(
    @Inject(PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT)
    private readonly repository: IProductStockPostSubtractRepositoryPort,
    @Inject(PRODUCT_STOCK_ON_HAND_PORT)
    private readonly onHand: IProductStockOnHandPort,
    @Inject(PRODUCT_STOCK_ARCHIVE_PORT)
    private readonly archive: IProductStockArchivePort,
    @Inject(PRODUCT_STOCK_TRANSACTION_PORT)
    private readonly transaction: IProductStockTransactionPort,
    @InjectPinoLogger(ProductStockPostSubtractUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductStockPostSubtractCommand): Promise<void> {
    await this.transaction.run(() => this.archiveOutOfStock(command));
  }

  private async archiveOutOfStock(command: IProductStockPostSubtractCommand): Promise<void> {
    const { productIds } = command;
    const stock = await this.onHand.lock({ productIds });
    const outOfStock = stock.filter((row) => row.quantity <= 0).map((row) => row.productId);
    const active = await this.repository.findActive(outOfStock);
    const activeIds = active.map((product) => product.id);

    for (const productId of activeIds) {
      const archived = await this.archive.archive({ productId });

      if (archived.archived) {
        this.logger.info({ productId }, 'Out-of-stock product archived');
      }
    }
  }
}
