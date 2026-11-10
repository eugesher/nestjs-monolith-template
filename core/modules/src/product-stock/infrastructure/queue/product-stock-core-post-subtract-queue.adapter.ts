import { InjectQueue } from '@nestjs/bull';
import { ClassProvider, Injectable } from '@nestjs/common';
import type { Queue } from 'bull';

import {
  IProductStockPostSubtractPayload,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';

import {
  IProductStockCorePostSubtractEnqueueCommand,
  IProductStockCorePostSubtractPort,
  PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockCorePostSubtractQueueAdapter implements IProductStockCorePostSubtractPort {
  public static readonly provider: ClassProvider<IProductStockCorePostSubtractPort> = {
    provide: PRODUCT_STOCK_CORE_POST_SUBTRACT_PORT,
    useClass: ProductStockCorePostSubtractQueueAdapter,
  };

  constructor(
    @InjectQueue(PRODUCT_STOCK_POST_SUBTRACT_QUEUE)
    private readonly queue: Queue<IProductStockPostSubtractPayload>,
  ) {}

  public async enqueue(command: IProductStockCorePostSubtractEnqueueCommand): Promise<void> {
    const { productIds, correlationId, timeoutMs } = command;
    let timer: NodeJS.Timeout | undefined;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Enqueue timed out after ${timeoutMs} ms`)),
        timeoutMs,
      );
    });

    try {
      await Promise.race([this.queue.add({ productIds, correlationId }), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
