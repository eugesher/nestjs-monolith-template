import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type IItemEventsPort, ITEM_EVENTS_PORT } from '../../outbound';
import { IItemArchiveCommand, IItemView } from '../interfaces';
import { ItemViewMapper } from '../mappers/item-view.mapper';
import { ItemLedgerService } from '../services/item-ledger.service';
import { ItemWriteService } from '../services/item-write.service';

@Injectable()
export class ItemArchiveUseCase {
  constructor(
    private readonly writeService: ItemWriteService,
    private readonly ledgerService: ItemLedgerService,
    @Inject(ITEM_EVENTS_PORT)
    private readonly events: IItemEventsPort,
    @InjectPinoLogger(ItemArchiveUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IItemArchiveCommand): Promise<IItemView> {
    const { itemId, ownerId, expectedVersion } = command;
    const written = await this.writeService.write({ itemId, ownerId, expectedVersion }, (item) =>
      item.archive(),
    );
    const { item, events } = written;

    await this.events.publish({ itemId, events });
    await this.ledgerService.recordArchived({ itemId, sku: item.sku, events });

    const view = ItemViewMapper.toView(item);

    this.logger.info({ itemId }, 'Item archived');

    return view;
  }
}
