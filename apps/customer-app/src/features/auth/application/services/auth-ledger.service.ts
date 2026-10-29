import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import { type IAuthLedgerPort, AUTH_LEDGER_PORT } from '../../outbound';
import { IAuthLedgerRecordRegisteredCommand } from '../interfaces/commands/auth-ledger-record-registered.command';

@Injectable()
export class AuthLedgerService {
  private static readonly LEDGER_APPEND_ATTEMPTS = 3;

  constructor(
    @Inject(AUTH_LEDGER_PORT)
    private readonly ledger: IAuthLedgerPort,
    @InjectPinoLogger(AuthLedgerService.name)
    private readonly logger: PinoLogger,
  ) {}

  public recordRegistered(command: IAuthLedgerRecordRegisteredCommand): Promise<void> {
    const { customerId } = command;
    const operationKey = `customer-registered:${customerId}`;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(AuthLedgerService.name);

    return ReplayRetryHelper.retryThenLogForReplay(
      () =>
        this.ledger.append({
          operationKey,
          subjectType: 'customer',
          subjectId: customerId,
          action: 'CustomerRegistered',
          payload: {},
          occurredAt,
        }),
      {
        maxAttempts: AuthLedgerService.LEDGER_APPEND_ATTEMPTS,
        logger: this.logger,
        correlationId,
        label: 'Ledger append (customer registered)',
        context: { customerId, operationKey },
        replayMessage:
          'Ledger append failed permanently: the customer is registered but absent from the ledger, replay this record',
      },
    );
  }
}
