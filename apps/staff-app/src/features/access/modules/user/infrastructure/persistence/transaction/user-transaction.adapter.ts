import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { USER_TRANSACTION_PORT, type IUserTransactionPort } from '../../../outbound';

@Injectable()
export class UserTransactionAdapter implements IUserTransactionPort {
  public static readonly provider: ClassProvider<IUserTransactionPort> = {
    provide: USER_TRANSACTION_PORT,
    useClass: UserTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
