import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IProductStockCoreMoveCommand,
  IProductStockCoreMoveView,
  ProductStockCoreMovementKindEnum,
} from '@acme-core/contracts/product-stock';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import {
  type IProductStockCoreMoveRepositoryPort,
  IProductStockCorePostSubtractEnqueueCommand,
  type IProductStockCorePostSubtractPort,
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_RETRY_ATTEMPTS,
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
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(PRODUCT_STOCK_CORE_POST_SUBTRACT_RETRY_ATTEMPTS)
    private readonly postSubtractRetryAttempts: number,
    @InjectPinoLogger(ProductStockCoreMoveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IProductStockCoreMoveCommand): Promise<IProductStockCoreMoveView> {
    const { kind, movements } = command;
    const sign = ProductStockCoreMoveUseCase.SIGNS[kind];
    const productIds = [...new Set(movements.map((movement) => movement.productId))];
    const rows = movements.map((movement) => ({
      productId: movement.productId,
      quantity: sign * movement.quantity,
      orderProductId: movement.orderProductId,
    }));

    await this.repository.lockProducts(productIds);

    const productStockIds = await this.repository.insertMany(rows);
    const stock = await this.repository.sumStock(productIds);

    if (kind === ProductStockCoreMovementKindEnum.SUBTRACT) {
      const correlationId = CorrelationContextHelper.current(ProductStockCoreMoveUseCase.name);

      this.transaction.afterCommit(() => this.announceSubtract({ productIds, correlationId }));
    }

    return { productStockIds, stock };
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
