import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  LEDGER_CATALOG_EVENTS,
  type ILedgerCatalogEventsItemArchivedProcessorPayload,
  type ILedgerCatalogEventsItemCreatedProcessorPayload,
} from '@acme-customer-contracts/ledger-catalog-events';
import {
  LedgerCatalogEventsRecordItemArchivedUseCase,
  LedgerCatalogEventsRecordItemCreatedUseCase,
} from '../application';

@Injectable()
export class LedgerCatalogEventsConsumer {
  constructor(
    private readonly recordItemCreated: LedgerCatalogEventsRecordItemCreatedUseCase,
    private readonly recordItemArchived: LedgerCatalogEventsRecordItemArchivedUseCase,
  ) {}

  @OnEvent(LEDGER_CATALOG_EVENTS.ITEM_CREATED)
  public async handleItemCreated(
    payload: ILedgerCatalogEventsItemCreatedProcessorPayload,
  ): Promise<void> {
    const { itemId, sku, name, ownerId, occurredAt } = payload;

    await this.recordItemCreated.execute({ itemId, sku, name, ownerId, occurredAt });
  }

  @OnEvent(LEDGER_CATALOG_EVENTS.ITEM_ARCHIVED)
  public async handleItemArchived(
    payload: ILedgerCatalogEventsItemArchivedProcessorPayload,
  ): Promise<void> {
    const { itemId, sku, previousStatus, occurredAt } = payload;

    await this.recordItemArchived.execute({ itemId, sku, previousStatus, occurredAt });
  }
}
