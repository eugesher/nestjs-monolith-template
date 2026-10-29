import { Inject, Injectable } from '@nestjs/common';

import { type ILedgerCoreAppendPort, LEDGER_CORE_APPEND_PORT } from '@acme-core/contracts/ledger';
import { IAuthLedgerAppendCommand, IAuthLedgerPort } from '../../outbound';

@Injectable()
export class AuthLedgerCoreAdapter implements IAuthLedgerPort {
  constructor(
    @Inject(LEDGER_CORE_APPEND_PORT)
    private readonly ledger: ILedgerCoreAppendPort,
  ) {}

  public async append(command: IAuthLedgerAppendCommand): Promise<void> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;

    await this.ledger.append({ operationKey, subjectType, subjectId, action, payload, occurredAt });
  }
}
