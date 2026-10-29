import { Inject, Injectable } from '@nestjs/common';

import {
  LEDGER_CATALOG_EVENTS,
  ILedgerCatalogEventsItemArchivedProcessorPayload,
  ILedgerCatalogEventsItemCreatedProcessorPayload,
  ILedgerCatalogEventsItemRenamedProcessorPayload,
} from '@acme-customer-contracts/ledger-catalog-events';
import { EVENT_PUBLISHER_PORT, type IEventPublisherPort } from '@acme-libs/contracts/messaging';
import { DomainEvent, Maybe } from '@acme-libs/toolkit';
import { ItemArchivedEvent, ItemCreatedEvent, ItemRenamedEvent } from '../../domain';
import { IItemEventsPort, IItemEventsPublishCommand } from '../../outbound';

@Injectable()
export class ItemEventsAdapter implements IItemEventsPort {
  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: IEventPublisherPort,
  ) {}

  public async publish(command: IItemEventsPublishCommand): Promise<void> {
    const { itemId, events } = command;

    for (const event of events) {
      await this.publishOne(itemId, event);
    }
  }

  private publishOne(itemId: string, event: DomainEvent<Maybe<string>>): Promise<void> {
    const occurredAt = event.occurredAt.toISOString();

    if (event instanceof ItemCreatedEvent) {
      const { sku, name, ownerId } = event;

      return this.publisher.publish<ILedgerCatalogEventsItemCreatedProcessorPayload>(
        LEDGER_CATALOG_EVENTS.ITEM_CREATED,
        {
          itemId,
          sku,
          name,
          ownerId,
          occurredAt,
        },
      );
    }

    if (event instanceof ItemRenamedEvent) {
      const { name, previousName } = event;

      return this.publisher.publish<ILedgerCatalogEventsItemRenamedProcessorPayload>(
        LEDGER_CATALOG_EVENTS.ITEM_RENAMED,
        {
          itemId,
          name,
          previousName,
          occurredAt,
        },
      );
    }

    if (event instanceof ItemArchivedEvent) {
      const { sku, previousStatus } = event;

      return this.publisher.publish<ILedgerCatalogEventsItemArchivedProcessorPayload>(
        LEDGER_CATALOG_EVENTS.ITEM_ARCHIVED,
        {
          itemId,
          sku,
          previousStatus,
          occurredAt,
        },
      );
    }

    throw new Error(`Item event ${event.constructor.name} has no catalog event name`);
  }
}
