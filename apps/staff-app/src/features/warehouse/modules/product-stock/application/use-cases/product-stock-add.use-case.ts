import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import {
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductNotFoundException,
} from '../../domain';
import {
  type IProductStockAddRepositoryPort,
  type IProductStockIdempotencyPort,
  type IProductStockMovementPort,
  PRODUCT_STOCK_ADD_REPOSITORY_PORT,
  PRODUCT_STOCK_IDEMPOTENCY_PORT,
  PRODUCT_STOCK_MOVEMENT_PORT,
} from '../../outbound';
import {
  IProductStockAddCommand,
  IProductStockAddWriteView,
  IProductStockView,
} from '../interfaces';
import { ProductStockLedgerService } from '../services/product-stock-ledger.service';

@Injectable()
export class ProductStockAddUseCase {
  constructor(
    private readonly ledgerService: ProductStockLedgerService,
    @Inject(PRODUCT_STOCK_ADD_REPOSITORY_PORT)
    private readonly repository: IProductStockAddRepositoryPort,
    @Inject(PRODUCT_STOCK_MOVEMENT_PORT)
    private readonly movement: IProductStockMovementPort,
    @Inject(PRODUCT_STOCK_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductStockIdempotencyPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(ProductStockAddUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductStockAddCommand): Promise<IProductStockView> {
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
      throw new ProductIdempotentRequestInFlightException(idempotencyKey);
    }

    if (claim.outcome === 'mismatch') {
      throw new ProductIdempotencyKeyReusedException(idempotencyKey);
    }

    try {
      const written = await this.transaction.run(() => this.persist(command));
      const { stock, productStockId, events } = written;

      await this.ledgerService.recordEvents({ productId, productStockId, events });

      this.logger.info({ productId, quantity, onHand: stock.quantity }, 'Product restocked');

      return stock;
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async persist(command: IProductStockAddCommand): Promise<IProductStockAddWriteView> {
    const { productId, quantity, idempotencyKey } = command;
    await this.movement.lock({ productId });

    const productStock = await this.repository.findById(productId);

    if (productStock === null) {
      throw new ProductNotFoundException(productId);
    }

    productStock.add(quantity);

    const events = productStock.pullDomainEvents();
    const added = await this.movement.add({ productId, quantity });
    const { productStockId } = added;
    const stock = { productId, quantity: added.quantity };

    await this.idempotency.complete({ key: idempotencyKey, response: stock });

    return { stock, productStockId, events };
  }
}
