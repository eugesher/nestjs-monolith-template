import { Inject, Injectable } from '@nestjs/common';

import { ItemDomainException, ItemErrorCodeEnum, ItemModel } from '../../domain';
import { type IItemAccessRepositoryPort, ITEM_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { IItemAccessLoadOwnedQuery } from '../interfaces/queries/item-access-load-owned.query';

@Injectable()
export class ItemAccessService {
  constructor(
    @Inject(ITEM_ACCESS_REPOSITORY_PORT)
    private readonly repository: IItemAccessRepositoryPort,
  ) {}

  public async loadOwned(query: IItemAccessLoadOwnedQuery): Promise<ItemModel> {
    const { itemId, ownerId } = query;
    const item = await this.repository.findById(itemId);

    if (item?.ownerId !== ownerId) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_NOT_FOUND,
        `Item ${itemId} was not found`,
      );
    }

    return item;
  }
}
