import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { ORDER_TRANSACTION_PORT, type IOrderTransactionPort } from '../../../outbound';

@Injectable()
export class OrderTransactionAdapter implements IOrderTransactionPort {
  public static readonly provider: ClassProvider<IOrderTransactionPort> = {
    provide: ORDER_TRANSACTION_PORT,
    useClass: OrderTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
