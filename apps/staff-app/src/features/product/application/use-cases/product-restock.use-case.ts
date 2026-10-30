import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { ProductDomainException, ProductErrorCodeEnum } from '../../domain';
import {
  type IProductIdempotencyPort,
  type IProductRestockRepositoryPort,
  type IProductStockPort,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_RESTOCK_REPOSITORY_PORT,
  PRODUCT_STOCK_PORT,
} from '../../outbound';
import { IProductRestockCommand, IProductStockView } from '../interfaces';
import { IProductRestockWriteView } from '../interfaces/views/product-restock-write.view';
import { ProductLedgerService } from '../services/product-ledger.service';

@Injectable()
export class ProductRestockUseCase {
  constructor(
    private readonly ledgerService: ProductLedgerService,
    @Inject(PRODUCT_RESTOCK_REPOSITORY_PORT)
    private readonly repository: IProductRestockRepositoryPort,
    @Inject(PRODUCT_STOCK_PORT)
    private readonly productStock: IProductStockPort,
    @Inject(PRODUCT_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductIdempotencyPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(ProductRestockUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductRestockCommand): Promise<IProductStockView> {
    const { productId, quantity, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IProductStockView>({
      key: idempotencyKey,
      body: { productId, quantity },
    });

    if (claim.outcome === 'replay') {
      this.logger.info({ idempotencyKey }, 'Product restock replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === 'in-flight') {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_IDEMPOTENT_REQUEST_IN_FLIGHT,
        `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
      );
    }

    if (claim.outcome === 'mismatch') {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_IDEMPOTENCY_KEY_REUSED,
        `Idempotency-Key ${idempotencyKey} was already used with a different request body`,
      );
    }

    try {
      return await this.restock(command);
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async restock(command: IProductRestockCommand): Promise<IProductStockView> {
    const { productId, quantity } = command;
    const written = await this.transaction.run(() => this.persist(command));
    const { stock, productStockId, events } = written;

    await this.ledgerService.enqueueRestocked({ productId, productStockId, events });

    this.logger.info({ productId, quantity, onHand: stock.quantity }, 'Product restocked');

    return stock;
  }

  private async persist(command: IProductRestockCommand): Promise<IProductRestockWriteView> {
    const { productId, quantity, idempotencyKey } = command;
    await this.productStock.lock({ productId });

    const product = await this.repository.findById(productId);

    if (product === null) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_NOT_FOUND,
        `Product ${productId} was not found`,
      );
    }

    product.restock(quantity);

    const events = product.pullDomainEvents();
    const restocked = await this.productStock.restock({ productId, quantity });
    const { productStockId } = restocked;
    const stock = { productId, quantity: restocked.quantity };

    await this.idempotency.complete({ key: idempotencyKey, response: stock });

    return { stock, productStockId, events };
  }
}
