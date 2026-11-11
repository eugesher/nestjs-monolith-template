import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { ROLE_TRANSACTION_PORT, type IRoleTransactionPort } from '../../../outbound';

@Injectable()
export class RoleTransactionAdapter implements IRoleTransactionPort {
  public static readonly provider: ClassProvider<IRoleTransactionPort> = {
    provide: ROLE_TRANSACTION_PORT,
    useClass: RoleTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
