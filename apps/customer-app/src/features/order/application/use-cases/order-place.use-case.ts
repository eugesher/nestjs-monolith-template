import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  OrderIdempotencyKeyReusedException,
  OrderIdempotentRequestInFlightException,
  OrderModel,
} from '../../domain';
import {
  ORDER_IDEMPOTENCY_PORT,
  ORDER_LEDGER_PORT,
  ORDER_PLACE_REPOSITORY_PORT,
  ORDER_PRODUCT_STOCK_PORT,
  ORDER_TRANSACTION_PORT,
  OrderIdempotencyOutcomeEnum,
  type IOrderIdempotencyPort,
  type IOrderLedgerPort,
  type IOrderPlaceRepositoryPort,
  type IOrderProductStockPort,
  type IOrderTransactionPort,
} from '../../outbound';
import type { IOrderPlaceCommand, IOrderView } from '../interfaces';

@Injectable()
export class OrderPlaceUseCase {
  constructor(
    @Inject(ORDER_PLACE_REPOSITORY_PORT)
    private readonly repository: IOrderPlaceRepositoryPort,
    @Inject(ORDER_PRODUCT_STOCK_PORT)
    private readonly productStock: IOrderProductStockPort,
    @Inject(ORDER_IDEMPOTENCY_PORT)
    private readonly idempotency: IOrderIdempotencyPort,
    @Inject(ORDER_LEDGER_PORT)
    private readonly ledger: IOrderLedgerPort,
    @Inject(ORDER_TRANSACTION_PORT)
    private readonly transaction: IOrderTransactionPort,
    @InjectPinoLogger(OrderPlaceUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IOrderPlaceCommand): Promise<IOrderView> {
    const { customerId, productIds, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IOrderView>({
      key: idempotencyKey,
      body: { customerId, productIds },
    });

    if (claim.outcome === OrderIdempotencyOutcomeEnum.REPLAY) {
      this.logger.info({ idempotencyKey }, 'Order placement replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === OrderIdempotencyOutcomeEnum.IN_FLIGHT) {
      throw new OrderIdempotentRequestInFlightException(idempotencyKey);
    }

    if (claim.outcome === OrderIdempotencyOutcomeEnum.MISMATCH) {
      throw new OrderIdempotencyKeyReusedException(idempotencyKey);
    }

    try {
      const view = await this.transaction.run(() => this.persist(command));
      const placedProductIds = view.products.map((product) => product.productId);

      await this.ledger.recordPlaced({
        orderId: view.id,
        customerId,
        productIds: placedProductIds,
      });

      this.logger.info(
        { orderId: view.id, customerId, units: placedProductIds.length },
        'Order placed',
      );

      return view;
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async persist(command: IOrderPlaceCommand): Promise<IOrderView> {
    const { customerId, productIds, idempotencyKey } = command;
    const distinctIds = [...new Set(productIds)];

    const stock = await this.productStock.lock({ productIds: distinctIds });
    const products = await this.repository.findActiveProducts(distinctIds);

    const draft = OrderModel.createDraft({ customerId, productIds, products, stock });
    const orderId = await this.repository.insertOrder({ customerId: draft.customerId });

    const orderProducts = draft.productIds.map((productId) => ({ orderId, productId }));
    await this.repository.insertOrderProducts(orderProducts);

    const record = await this.repository.findPlaced(orderId);

    const placed = OrderModel.reconstitute(record);
    const view = placed.toSnapshot();
    const movements = placed.getMovements();

    await this.productStock.withdraw({ movements });
    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
