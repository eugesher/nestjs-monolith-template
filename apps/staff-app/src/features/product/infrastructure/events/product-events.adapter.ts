import { Inject, Injectable } from '@nestjs/common';

import {
  LEDGER_CATALOG_EVENTS,
  ILedgerCatalogEventsProductArchivedProcessorPayload,
  ILedgerCatalogEventsProductCreatedProcessorPayload,
  ILedgerCatalogEventsProductRenamedProcessorPayload,
} from '@acme-staff-contracts/ledger-catalog-events';
import { EVENT_PUBLISHER_PORT, type IEventPublisherPort } from '@acme-libs/contracts/messaging';
import { DomainEvent, Maybe } from '@acme-libs/toolkit';
import { ProductArchivedEvent, ProductCreatedEvent, ProductRenamedEvent } from '../../domain';
import { IProductEventsPort, IProductEventsPublishCommand } from '../../outbound';

@Injectable()
export class ProductEventsAdapter implements IProductEventsPort {
  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: IEventPublisherPort,
  ) {}

  public async publish(command: IProductEventsPublishCommand): Promise<void> {
    const { productId, events } = command;

    for (const event of events) {
      await this.publishOne(productId, event);
    }
  }

  private publishOne(productId: string, event: DomainEvent<Maybe<string>>): Promise<void> {
    const occurredAt = event.occurredAt.toISOString();

    if (event instanceof ProductCreatedEvent) {
      const { sku, name } = event;

      return this.publisher.publish<ILedgerCatalogEventsProductCreatedProcessorPayload>(
        LEDGER_CATALOG_EVENTS.PRODUCT_CREATED,
        {
          productId,
          sku,
          name,
          occurredAt,
        },
      );
    }

    if (event instanceof ProductRenamedEvent) {
      const { name, previousName } = event;

      return this.publisher.publish<ILedgerCatalogEventsProductRenamedProcessorPayload>(
        LEDGER_CATALOG_EVENTS.PRODUCT_RENAMED,
        {
          productId,
          name,
          previousName,
          occurredAt,
        },
      );
    }

    if (event instanceof ProductArchivedEvent) {
      const { sku, previousStatus } = event;

      return this.publisher.publish<ILedgerCatalogEventsProductArchivedProcessorPayload>(
        LEDGER_CATALOG_EVENTS.PRODUCT_ARCHIVED,
        {
          productId,
          sku,
          previousStatus,
          occurredAt,
        },
      );
    }

    throw new Error(`Product event ${event.constructor.name} has no catalog event name`);
  }
}
