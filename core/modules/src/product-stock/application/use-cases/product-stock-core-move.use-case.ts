import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import {
  ProductStockCoreMovementKindEnum,
  type IProductStockCoreMoveCommand,
  type IProductStockCoreMoveView,
} from '@acme-core/contracts/product-stock';

import { ProductStockCoreOnHandModel } from '../../domain';
import {
  PRODUCT_STOCK_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT,
  PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  PRODUCT_STOCK_CORE_TRANSACTION_PORT,
  type IProductStockCoreMoveRepositoryPort,
  type IProductStockCorePostSubtractEnqueueCommand,
  type IProductStockCorePostSubtractPort,
  type IProductStockCoreTransactionPort,
} from '../../outbound';

@Injectable()
export class ProductStockCoreMoveUseCase {
  private static readonly SIGNS: Record<ProductStockCoreMovementKindEnum, number> = {
    [ProductStockCoreMovementKindEnum.ADD]: 1,
    [ProductStockCoreMovementKindEnum.SUBTRACT]: -1,
  };

  constructor(
    @Inject(PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT)
    private readonly repository: IProductStockCoreMoveRepositoryPort,
    @Inject(PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT)
    private readonly postSubtract: IProductStockCorePostSubtractPort,
    @Inject(PRODUCT_STOCK_CORE_TRANSACTION_PORT)
    private readonly transaction: IProductStockCoreTransactionPort,
    @Inject(PRODUCT_STOCK_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN)
    private readonly postSubtractRetryAttempts: number,
    @Inject(PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    private readonly postSubtractTimeoutMs: number,
    @InjectPinoLogger(ProductStockCoreMoveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView> {
    const { kind, movements } = command;
    const sign = ProductStockCoreMoveUseCase.SIGNS[kind];
    const productIds = [...new Set(movements.map((movement) => movement.productId))];
    const movementRows = movements.map((movement) => ({
      productId: movement.productId,
      quantity: sign * movement.quantity,
      orderProductId: movement.orderProductId,
    }));

    await this.repository.lockProducts(productIds);

    const insertedIdentifiers = await this.repository.insertMany(movementRows);
    const productStockIds = insertedIdentifiers.map((identifier) => String(identifier.id));
    const stockSums = await this.repository.sumStock(productIds);
    const onHand = ProductStockCoreOnHandModel.reconstitute({ productIds, sums: stockSums });
    const stockOnHand = onHand.toSnapshot();

    if (kind === ProductStockCoreMovementKindEnum.SUBTRACT) {
      const correlationId = CorrelationContextHelper.current(ProductStockCoreMoveUseCase.name);

      this.transaction.afterCommit(() =>
        this.announceSubtract({
          productIds,
          correlationId,
          timeoutMs: this.postSubtractTimeoutMs,
        }),
      );
    }

    return { productStockIds, stock: stockOnHand };
  }

  private async announceSubtract(
    command: IProductStockCorePostSubtractEnqueueCommand,
  ): Promise<void> {
    const { productIds, correlationId } = command;

    await ReplayRetryHelper.retryThenLogForReplay(() => this.postSubtract.enqueue(command), {
      maxAttempts: this.postSubtractRetryAttempts,
      logger: this.logger,
      correlationId,
      label: 'Post-subtract enqueue',
      context: { productIds },
      replayMessage:
        'Post-subtract enqueue failed permanently: the out-of-stock check of these products did not run, replay it',
    });
  }
}
