import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { NOTE_TRANSACTION_PORT, type INoteTransactionPort } from '../../../outbound';

@Injectable()
export class NoteTransactionAdapter implements INoteTransactionPort {
  public static readonly provider: ClassProvider<INoteTransactionPort> = {
    provide: NOTE_TRANSACTION_PORT,
    useClass: NoteTransactionAdapter,
  };

  constructor(
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
  ) {}

  public async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.transaction.run(work);
  }
}
