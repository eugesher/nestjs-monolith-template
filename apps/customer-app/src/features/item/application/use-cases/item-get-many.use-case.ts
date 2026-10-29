import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { type IItemCrudRepositoryPort, ITEM_CRUD_REPOSITORY_PORT } from '../../outbound';
import { IItemGetManyQuery, IItemView } from '../interfaces';
import { ItemViewMapper } from '../mappers/item-view.mapper';

@Injectable()
export class ItemGetManyUseCase {
  constructor(
    @Inject(ITEM_CRUD_REPOSITORY_PORT)
    private readonly repository: IItemCrudRepositoryPort,
  ) {}

  public async execute(query: IItemGetManyQuery): Promise<IPage<IItemView>> {
    const { page, size, ownerId } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({ ...window, ownerId });
    const items = result.items.map((item) => ItemViewMapper.toView(item));

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
