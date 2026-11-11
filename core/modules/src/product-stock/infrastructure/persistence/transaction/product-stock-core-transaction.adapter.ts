import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import {
  PRODUCT_STOCK_CORE_TRANSACTION_PORT,
  type IProductStockCoreTransactionPort,
} from '../../../outbound';

@Injectable()
export class ProductStockCoreTransactionAdapter implements IProductStockCoreTransactionPort {
  public static readonly provider: ClassProvider<IProductStockCoreTransactionPort> = {
    provide: PRODUCT_STOCK_CORE_TRANSACTION_PORT,
    useClass: ProductStockCoreTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }

  public afterCommit(hook: () => Promise<void>): void {
    this.transaction.afterCommit(hook);
  }
}
