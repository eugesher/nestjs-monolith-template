import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import {
  OrderIdempotencyKeyReusedException,
  OrderIdempotentRequestInFlightException,
  OrderModel,
} from '../../domain';
import {
  type IOrderIdempotencyPort,
  type IOrderPlaceRepositoryPort,
  type IOrderProductStockPort,
  ORDER_IDEMPOTENCY_PORT,
  ORDER_PLACE_REPOSITORY_PORT,
  ORDER_PRODUCT_STOCK_PORT,
} from '../../outbound';
import { IOrderPlaceCommand, IOrderView } from '../interfaces';
import { OrderStockMapper } from '../mappers/order-stock.mapper';
import { OrderViewMapper } from '../mappers/order-view.mapper';
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
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(OrderPlaceUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IOrderPlaceCommand): Promise<IOrderView> {
    const { customerId, productIds, idempotencyKey } = command;
    const claim = await this.idempotency.claim<IOrderView>({
      key: idempotencyKey,
      body: { customerId, productIds },
    });

    if (claim.outcome === 'replay') {
      this.logger.info({ idempotencyKey }, 'Order placement replayed from the idempotency store');

      return claim.storedResponse;
    }

    if (claim.outcome === 'in-flight') {
      throw new OrderIdempotentRequestInFlightException(idempotencyKey);
    }

    if (claim.outcome === 'mismatch') {
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
    const quantities = await this.productStock.lock({ productIds: distinctIds });
    const products = await this.repository.findActiveProducts(distinctIds);
    const stock = OrderStockMapper.toStock(products, quantities);
    const draft = OrderModel.place({ customerId, productIds, stock });
    const placed = await this.repository.insert(draft);
    const view = OrderViewMapper.toView(placed);
    const movements = view.products.map((product) => ({
      productId: product.productId,
      orderProductId: product.id,
    }));

    await this.productStock.withdraw({ movements });
    await this.idempotency.complete({ key: idempotencyKey, response: view });

    return view;
  }
}
