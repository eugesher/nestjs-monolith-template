import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';

import { SubjectLedgerQueueAdapter } from '@acme-libs/ledger';
import { LEDGER_RECORD_QUEUE, ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

import {
  IAuthLedgerRecordPort,
  AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  AUTH_LEDGER_RECORD_PORT,
} from '../../outbound';

@Injectable()
export class AuthLedgerQueueAdapter
  extends SubjectLedgerQueueAdapter
  implements IAuthLedgerRecordPort
{
  public static readonly provider: ClassProvider<IAuthLedgerRecordPort> = {
    provide: AUTH_LEDGER_RECORD_PORT,
    useClass: AuthLedgerQueueAdapter,
  };

  constructor(
    @InjectQueue(LEDGER_RECORD_QUEUE)
    protected readonly queue: Queue<ILedgerRecordProcessorPayload>,
    @Inject(AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN)
    protected readonly timeoutMs: number,
  ) {
    super();
  }
}
