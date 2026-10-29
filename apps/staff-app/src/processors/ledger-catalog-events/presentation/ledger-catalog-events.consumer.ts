import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  LEDGER_CATALOG_EVENTS,
  type ILedgerCatalogEventsProductArchivedProcessorPayload,
  type ILedgerCatalogEventsProductCreatedProcessorPayload,
} from '@acme-staff-contracts/ledger-catalog-events';
import {
  LedgerCatalogEventsRecordProductArchivedUseCase,
  LedgerCatalogEventsRecordProductCreatedUseCase,
} from '../application';

@Injectable()
export class LedgerCatalogEventsConsumer {
  constructor(
    private readonly recordProductCreated: LedgerCatalogEventsRecordProductCreatedUseCase,
    private readonly recordProductArchived: LedgerCatalogEventsRecordProductArchivedUseCase,
  ) {}

  @OnEvent(LEDGER_CATALOG_EVENTS.PRODUCT_CREATED)
  public async handleProductCreated(
    payload: ILedgerCatalogEventsProductCreatedProcessorPayload,
  ): Promise<void> {
    const { productId, sku, name, occurredAt } = payload;

    await this.recordProductCreated.execute({ productId, sku, name, occurredAt });
  }

  @OnEvent(LEDGER_CATALOG_EVENTS.PRODUCT_ARCHIVED)
  public async handleProductArchived(
    payload: ILedgerCatalogEventsProductArchivedProcessorPayload,
  ): Promise<void> {
    const { productId, sku, previousStatus, occurredAt } = payload;

    await this.recordProductArchived.execute({ productId, sku, previousStatus, occurredAt });
  }
}
