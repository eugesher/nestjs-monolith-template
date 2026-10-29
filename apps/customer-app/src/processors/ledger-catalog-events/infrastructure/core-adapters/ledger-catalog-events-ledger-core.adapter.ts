import { Inject, Injectable } from '@nestjs/common';

import { type ILedgerCoreAppendPort, LEDGER_CORE_APPEND_PORT } from '@acme-core/contracts/ledger';
import {
  ILedgerCatalogEventsLedgerAppendCommand,
  ILedgerCatalogEventsLedgerAppendView,
  ILedgerCatalogEventsLedgerPort,
} from '../../outbound';

@Injectable()
export class LedgerCatalogEventsLedgerCoreAdapter implements ILedgerCatalogEventsLedgerPort {
  constructor(
    @Inject(LEDGER_CORE_APPEND_PORT)
    private readonly ledger: ILedgerCoreAppendPort,
  ) {}

  public async append(
    command: ILedgerCatalogEventsLedgerAppendCommand,
  ): Promise<ILedgerCatalogEventsLedgerAppendView> {
    const { operationKey, subjectType, subjectId, action, payload, occurredAt } = command;
    const view = await this.ledger.append({
      operationKey,
      subjectType,
      subjectId,
      action,
      payload,
      occurredAt,
    });
    const { appended } = view;

    return { appended };
  }
}
