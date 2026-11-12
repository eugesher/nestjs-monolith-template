import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { LEDGER_LIB_PORT, type ILedgerLibPort } from '@acme-libs/contracts/ledger';

import {
  AUTH_LEDGER_PORT,
  type IAuthLedgerPort,
  type IAuthLedgerRecordRegisteredCommand,
} from '../../outbound';

@Injectable()
export class AuthLedgerLibAdapter implements IAuthLedgerPort {
  public static readonly provider: ClassProvider<IAuthLedgerPort> = {
    provide: AUTH_LEDGER_PORT,
    useClass: AuthLedgerLibAdapter,
  };

  constructor(
    @Inject(LEDGER_LIB_PORT)
    private readonly ledger: ILedgerLibPort,
  ) {}

  public async recordRegistered(command: IAuthLedgerRecordRegisteredCommand): Promise<void> {
    const { customerId } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(AuthLedgerLibAdapter.name);

    await this.ledger.handleEnqueue({
      operationKey: `customer-registered:${customerId}`,
      subjectType: 'customer',
      subjectId: customerId,
      action: 'CustomerRegistered',
      payload: {},
      occurredAt,
      correlationId,
    });
  }
}
