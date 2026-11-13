import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { LEDGER_CORE_PORT, type ILedgerCorePort } from '@acme-core/contracts/ledger';

import {
  AUTH_LEDGER_PORT,
  type IAuthLedgerPort,
  type IAuthLedgerRecordRegisteredCommand,
} from '../../outbound';

@Injectable()
export class AuthLedgerCoreAdapter implements IAuthLedgerPort {
  public static readonly provider: ClassProvider<IAuthLedgerPort> = {
    provide: AUTH_LEDGER_PORT,
    useClass: AuthLedgerCoreAdapter,
  };

  constructor(
    @Inject(LEDGER_CORE_PORT)
    private readonly ledger: ILedgerCorePort,
  ) {}

  public async recordRegistered(command: IAuthLedgerRecordRegisteredCommand): Promise<void> {
    const { customerId } = command;
    const occurredAt = new Date().toISOString();

    await this.ledger.handleEnqueue({
      operationKey: `customer-registered:${customerId}`,
      subjectType: 'customer',
      subjectId: customerId,
      action: 'CustomerRegistered',
      payload: {},
      occurredAt,
    });
  }
}
