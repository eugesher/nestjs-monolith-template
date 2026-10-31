import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

import {
  type IProductStockPostSubtractPayload,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';
import {
  IProductStockCorePostSubtractEnqueueCommand,
  IProductStockCorePostSubtractPort,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_TIMEOUT_MS,
} from '../../outbound';

@Injectable()
export class ProductStockCorePostSubtractQueueAdapter implements IProductStockCorePostSubtractPort {
  constructor(
    @InjectQueue(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)
    private readonly queue: Queue<IProductStockPostSubtractPayload>,
    @Inject(PRODUCT_STOCK_CORE_POST_SUBTRACT_TIMEOUT_MS)
    private readonly timeoutMs: number,
  ) {}

  public async enqueue(command: IProductStockCorePostSubtractEnqueueCommand): Promise<void> {
    const { productIds, correlationId } = command;
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Enqueue timed out after ${this.timeoutMs} ms`)),
        this.timeoutMs,
      );
    });

    try {
      await Promise.race([this.queue.add({ productIds, correlationId }), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
