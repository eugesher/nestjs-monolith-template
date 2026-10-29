import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { CorrelationContextHelper } from '@acme-libs/observability';
import { ReplayRetryHelper } from '@acme-libs/toolkit';
import {
  type ILedgerCatalogEventsLedgerPort,
  ILedgerCatalogEventsLedgerAppendCommand,
  LEDGER_CATALOG_EVENTS_LEDGER_PORT,
} from '../../outbound';

@Injectable()
export class LedgerCatalogEventsRecordService {
  private static readonly LEDGER_APPEND_ATTEMPTS = 3;

  constructor(
    @Inject(LEDGER_CATALOG_EVENTS_LEDGER_PORT)
    private readonly ledger: ILedgerCatalogEventsLedgerPort,
    @InjectPinoLogger(LedgerCatalogEventsRecordService.name)
    private readonly logger: PinoLogger,
  ) {}

  public async record(command: ILedgerCatalogEventsLedgerAppendCommand): Promise<void> {
    const { operationKey, action } = command;
    const correlationId = CorrelationContextHelper.current(LedgerCatalogEventsRecordService.name);

    this.logger.info({ operationKey, action }, 'Catalog event received');

    await ReplayRetryHelper.retryThenLogForReplay(() => this.append(command), {
      maxAttempts: LedgerCatalogEventsRecordService.LEDGER_APPEND_ATTEMPTS,
      logger: this.logger,
      correlationId,
      label: 'Ledger append (catalog event)',
      context: { operationKey },
      replayMessage:
        'Ledger append failed permanently: the catalog event is absent from the ledger, replay this record',
    });
  }

  private async append(command: ILedgerCatalogEventsLedgerAppendCommand): Promise<void> {
    const { operationKey } = command;
    const view = await this.ledger.append(command);
    const { appended } = view;
    const message = appended ? 'Catalog event recorded' : 'Catalog event already recorded';

    this.logger.info({ operationKey, appended }, message);
  }
}
