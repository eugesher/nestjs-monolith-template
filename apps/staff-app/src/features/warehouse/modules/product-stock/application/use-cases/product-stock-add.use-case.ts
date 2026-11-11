import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import {
  ProductIdempotencyKeyReusedException,
  ProductIdempotentRequestInFlightException,
  ProductNotFoundException,
  ProductStockAddedEvent,
  ProductStockModel,
} from '../../domain';
import {
  PRODUCT_STOCK_ADD_REPOSITORY_PORT,
  PRODUCT_STOCK_IDEMPOTENCY_PORT,
  PRODUCT_STOCK_LEDGER_PORT,
  PRODUCT_STOCK_MOVEMENT_PORT,
  PRODUCT_STOCK_TRANSACTION_PORT,
  ProductStockIdempotencyOutcomeEnum,
  type IProductStockAddRepositoryPort,
  type IProductStockIdempotencyPort,
  type IProductStockLedgerPort,
  type IProductStockMovementPort,
  type IProductStockTransactionPort,
} from '../../outbound';
import type {
  IProductStockAddCommand,
  IProductStockAddView,
  IProductStockAddWriteView,
} from '../interfaces';

@Injectable()
export class ProductStockAddUseCase {
  constructor(
    @Inject(PRODUCT_STOCK_ADD_REPOSITORY_PORT)
    private readonly repository: IProductStockAddRepositoryPort,
    @Inject(PRODUCT_STOCK_MOVEMENT_PORT)
    private readonly movement: IProductStockMovementPort,
    @Inject(PRODUCT_STOCK_IDEMPOTENCY_PORT)
    private readonly idempotency: IProductStockIdempotencyPort,
    @Inject(PRODUCT_STOCK_LEDGER_PORT)
    private readonly ledger: IProductStockLedgerPort,
    @Inject(PRODUCT_STOCK_TRANSACTION_PORT)
    private readonly transaction: IProductStockTransactionPort,
    @InjectPinoLogger(ProductStockAddUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductStockAddCommand): Promise<IProductStockAddView> {
    const { productId, quantity, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IProductStockAddView>({
      key: idempotencyKey,
      body: { productId, quantity },
    });

    if (claim.outcome === ProductStockIdempotencyOutcomeEnum.REPLAY) {
      this.logger.info({ idempotencyKey }, 'Product restock replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === ProductStockIdempotencyOutcomeEnum.IN_FLIGHT) {
      throw new ProductIdempotentRequestInFlightException(idempotencyKey);
    }

    if (claim.outcome === ProductStockIdempotencyOutcomeEnum.MISMATCH) {
      throw new ProductIdempotencyKeyReusedException(idempotencyKey);
    }

    try {
      const written = await this.transaction.run(() => this.persist(command));
      const { stock, productStockId, events } = written;
      const added = events.filter((event) => event instanceof ProductStockAddedEvent);

      await this.ledger.recordEvents({ productStockId, events: added });

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

    const record = await this.repository.findById(productId);

    if (!record) {
      throw new ProductNotFoundException(productId);
    }

    const productStock = ProductStockModel.reconstitute(record);

    productStock.add(quantity);

    const events = productStock.pullDomainEvents();
    const added = await this.movement.add({ productId, quantity });
    const { productStockId } = added;
    const stock = { productId, quantity: added.quantity };

    await this.idempotency.complete({ key: idempotencyKey, response: stock });

    return { stock, productStockId, events };
  }
}
