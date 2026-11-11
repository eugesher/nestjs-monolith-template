import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import {
  PRODUCT_STOCK_TRANSACTION_PORT,
  type IProductStockTransactionPort,
} from '../../../outbound';

@Injectable()
export class ProductStockTransactionAdapter implements IProductStockTransactionPort {
  public static readonly provider: ClassProvider<IProductStockTransactionPort> = {
    provide: PRODUCT_STOCK_TRANSACTION_PORT,
    useClass: ProductStockTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
