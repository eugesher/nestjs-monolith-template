import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type IItemEventsPort, ITEM_EVENTS_PORT } from '../../outbound';
import { IItemRenameCommand, IItemView } from '../interfaces';
import { ItemViewMapper } from '../mappers/item-view.mapper';
import { ItemWriteService } from '../services/item-write.service';

@Injectable()
export class ItemRenameUseCase {
  constructor(
    private readonly writeService: ItemWriteService,
    @Inject(ITEM_EVENTS_PORT)
    private readonly events: IItemEventsPort,
    @InjectPinoLogger(ItemRenameUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IItemRenameCommand): Promise<IItemView> {
    const { itemId, name, ownerId, expectedVersion } = command;
    const written = await this.writeService.write({ itemId, ownerId, expectedVersion }, (item) =>
      item.rename(name),
    );
    const { item, events } = written;

    await this.events.publish({ itemId, events });

    const view = ItemViewMapper.toView(item);

    this.logger.info({ itemId, version: view.version }, 'Item renamed');

    return view;
  }
}
