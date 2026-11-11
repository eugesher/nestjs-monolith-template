import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { PRODUCT_CORE_TRANSACTION_PORT, type IProductCoreTransactionPort } from '../../../outbound';

@Injectable()
export class ProductCoreTransactionAdapter implements IProductCoreTransactionPort {
  public static readonly provider: ClassProvider<IProductCoreTransactionPort> = {
    provide: PRODUCT_CORE_TRANSACTION_PORT,
    useClass: ProductCoreTransactionAdapter,
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
