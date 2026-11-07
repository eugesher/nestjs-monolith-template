import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { SubjectLedgerService } from '@acme-libs/ledger';
import { CorrelationContextHelper } from '@acme-libs/observability';

import {
  AUTH_LEDGER_RECORD_PORT,
  AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
  type IAuthLedgerRecordPort,
} from '../../outbound';
import { IAuthLedgerRecordRegisteredCommand } from '../interfaces';

@Injectable()
export class AuthLedgerService extends SubjectLedgerService {
  constructor(
    @Inject(AUTH_LEDGER_RECORD_PORT)
    protected readonly queue: IAuthLedgerRecordPort,
    @Inject(AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN)
    protected readonly retryAttempts: number,
    @InjectPinoLogger(AuthLedgerService.name)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  public async recordRegistered(command: IAuthLedgerRecordRegisteredCommand): Promise<void> {
    const { customerId, email } = command;
    const occurredAt = new Date().toISOString();
    const correlationId = CorrelationContextHelper.current(AuthLedgerService.name);

    await this.record({
      operationKey: `customer-registered:${customerId}`,
      subjectType: 'customer',
      subjectId: customerId,
      action: 'CustomerRegistered',
      payload: { email },
      occurredAt,
      correlationId,
    });
  }
}
