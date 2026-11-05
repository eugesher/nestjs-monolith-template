import { BullModule } from '@nestjs/bull';

import {
  PRODUCT_STOCK_POST_SUBTRACT_JOB_OPTIONS,
  PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
} from '@acme-core/contracts/product-stock';

export const ProductStockPostSubtractQueueModule = BullModule.registerQueue({
  name: PRODUCT_STOCK_POST_SUBTRACT_QUEUE,
  defaultJobOptions: PRODUCT_STOCK_POST_SUBTRACT_JOB_OPTIONS,
});
