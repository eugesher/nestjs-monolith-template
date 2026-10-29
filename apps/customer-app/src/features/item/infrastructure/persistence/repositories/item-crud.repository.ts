import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Item } from '@acme-core/entities';
import { IPage } from '@acme-libs/toolkit';
import { ItemModel } from '../../../domain';
import { type IItemCrudRepositoryPort, IItemPageQuery } from '../../../outbound';
import { ItemMapper } from '../mappers/item.mapper';

@Injectable()
export class ItemCrudRepository implements IItemCrudRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get items(): Repository<Item> {
    return this.txHost.tx.getRepository(Item);
  }

  public async list(query: IItemPageQuery): Promise<IPage<ItemModel>> {
    const { page, size, ownerId } = query;
    const byOwner = ownerId === undefined ? {} : { ownerId };
    const [items, total] = await this.items.findAndCount({
      where: byOwner,
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: items.map((item) => ItemMapper.toModel(item)),
      total,
      page,
      size,
    };
  }
}
