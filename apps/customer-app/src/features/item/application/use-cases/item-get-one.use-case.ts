import { Injectable } from '@nestjs/common';

import { IItemGetOneQuery, IItemView } from '../interfaces';
import { ItemViewMapper } from '../mappers/item-view.mapper';
import { ItemAccessService } from '../services/item-access.service';

@Injectable()
export class ItemGetOneUseCase {
  constructor(private readonly accessService: ItemAccessService) {}

  public async execute(query: IItemGetOneQuery): Promise<IItemView> {
    const { itemId, ownerId } = query;
    const item = await this.accessService.loadOwned({ itemId, ownerId });

    return ItemViewMapper.toView(item);
  }
}
