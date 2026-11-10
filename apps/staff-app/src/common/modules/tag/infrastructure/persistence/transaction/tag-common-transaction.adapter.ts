import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { ITagCommonTransactionPort, TAG_COMMON_TRANSACTION_PORT } from '../../../outbound';

@Injectable()
export class TagCommonTransactionAdapter implements ITagCommonTransactionPort {
  public static readonly provider: ClassProvider<ITagCommonTransactionPort> = {
    provide: TAG_COMMON_TRANSACTION_PORT,
    useClass: TagCommonTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
