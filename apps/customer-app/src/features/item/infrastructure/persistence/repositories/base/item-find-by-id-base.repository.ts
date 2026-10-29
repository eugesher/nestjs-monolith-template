import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Item } from '@acme-core/entities';
import { Nullable } from '@acme-libs/toolkit';
import { ItemModel } from '../../../../domain';
import { ItemMapper } from '../../mappers/item.mapper';

export abstract class ItemFindByIdBaseRepository {
  protected constructor(protected readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  protected get items(): Repository<Item> {
    return this.txHost.tx.getRepository(Item);
  }

  public async findById(itemId: string): Promise<Nullable<ItemModel>> {
    const item = await this.items.findOne({ where: { id: itemId } });

    return item === null ? null : ItemMapper.toModel(item);
  }
}
