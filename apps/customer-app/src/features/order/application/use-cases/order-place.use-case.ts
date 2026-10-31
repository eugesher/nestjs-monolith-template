import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { OrderDomainException, OrderErrorCodeEnum, OrderModel } from '../../domain';
import {
  type IOrderCatalogCachePort,
  type IOrderIdempotencyPort,
  type IOrderPlaceRepositoryPort,
  type IOrderProductStockPort,
  ORDER_CATALOG_CACHE_PORT,
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
    @Inject(ORDER_CATALOG_CACHE_PORT)
    private readonly catalogCache: IOrderCatalogCachePort,
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
      throw new OrderDomainException(
        OrderErrorCodeEnum.ORDER_IDEMPOTENT_REQUEST_IN_FLIGHT,
        `Idempotency-Key ${idempotencyKey} is still being processed, retry shortly`,
      );
    }

    if (claim.outcome === 'mismatch') {
      throw new OrderDomainException(
        OrderErrorCodeEnum.ORDER_IDEMPOTENCY_KEY_REUSED,
        `Idempotency-Key ${idempotencyKey} was already used with a different request body`,
      );
    }

    try {
      return await this.place(command);
    } catch (error) {
      await this.idempotency.release({ key: idempotencyKey });

      throw error;
    }
  }

  private async place(command: IOrderPlaceCommand): Promise<IOrderView> {
    const { customerId } = command;
    const view = await this.transaction.run(() => this.persist(command));
    const productIds = view.products.map((product) => product.productId);

    await this.catalogCache.invalidate();
    await this.ledgerService.recordPlaced({ orderId: view.id, customerId, productIds });

    this.logger.info({ orderId: view.id, customerId, units: productIds.length }, 'Order placed');

    return view;
  }

  private async persist(command: IOrderPlaceCommand): Promise<IOrderView> {
    const { customerId, productIds, idempotencyKey } = command;
    const distinctIds = [...new Set(productIds)];
    const quantities = await this.productStock.lock({ productIds: distinctIds });
    const products = await this.repository.findProducts(distinctIds);
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
