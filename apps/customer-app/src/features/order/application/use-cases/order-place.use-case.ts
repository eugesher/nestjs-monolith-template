import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  LOCAL_STORAGE_TRANSACTION,
  type ILocalStorageTransaction,
} from '@acme-libs/contracts/local-storage';

import {
  OrderIdempotencyKeyReusedException,
  OrderIdempotentRequestInFlightException,
  OrderModel,
} from '../../domain';
import {
  ORDER_IDEMPOTENCY_PORT,
  ORDER_PLACE_REPOSITORY_PORT,
  ORDER_PRODUCT_STOCK_PORT,
  OrderIdempotencyOutcomeEnum,
  type IOrderIdempotencyPort,
  type IOrderPlaceRepositoryPort,
  type IOrderProductStockPort,
} from '../../outbound';
import { IOrderPlaceCommand, IOrderView } from '../interfaces';
import { OrderLedgerService } from '../services/order-ledger.service';

@Injectable()
export class OrderPlaceUseCase {
  constructor(
    private readonly ledgerService: OrderLedgerService,
    @Inject(ORDER_PLACE_REPOSITORY_PORT)
    private readonly repository: IOrderPlaceRepositoryPort,
    @Inject(ORDER_PRODUCT_STOCK_PORT)
    private readonly productStock: IOrderProductStockPort,
    @Inject(ORDER_IDEMPOTENCY_PORT)
    private readonly idempotency: IOrderIdempotencyPort,
    @Inject(LOCAL_STORAGE_TRANSACTION)
    private readonly transaction: ILocalStorageTransaction,
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

      await this.ledgerService.recordPlaced({
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
    const view = placed.toView();
    const movements = placed.getMovements();

    await this.productStock.withdraw({ movements });
    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
