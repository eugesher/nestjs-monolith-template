import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { IProductTransactionPort, PRODUCT_TRANSACTION_PORT } from '../../../outbound';

@Injectable()
export class ProductTransactionAdapter implements IProductTransactionPort {
  public static readonly provider: ClassProvider<IProductTransactionPort> = {
    provide: PRODUCT_TRANSACTION_PORT,
    useClass: ProductTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
