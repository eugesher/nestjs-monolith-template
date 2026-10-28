import { Inject, Injectable } from '@nestjs/common';

import { OwnershipHelper } from '@acme-libs/toolkit';
import { ItemDomainException, ItemErrorCodeEnum, ItemModel } from '../../domain';
import { type IItemAccessRepositoryPort, ITEM_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { IItemAccessLoadOwnedQuery } from '../interfaces/queries/item-access-load-owned.query';

@Injectable()
export class ItemAccessService {
  constructor(
    @Inject(ITEM_ACCESS_REPOSITORY_PORT)
    private readonly repository: IItemAccessRepositoryPort,
  ) {}

  public loadOwned(query: IItemAccessLoadOwnedQuery): Promise<ItemModel> {
    const { itemId, ownerId } = query;

    return OwnershipHelper.loadOwned({
      find: () => this.repository.findById(itemId),
      owner: (item) => item.ownerId,
      requiredOwner: ownerId,
      onMissing: () => {
        throw new ItemDomainException(
          ItemErrorCodeEnum.ITEM_NOT_FOUND,
          `Item ${itemId} was not found`,
        );
      },
      onForbidden: () => {
        throw new ItemDomainException(
          ItemErrorCodeEnum.ITEM_ACCESS_FORBIDDEN,
          `Item ${itemId} does not belong to the caller`,
        );
      },
    });
  }
}
