import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Item } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { ItemDomainException, ItemErrorCodeEnum, ItemModel } from '../../../domain';
import { type IItemCreateRepositoryPort } from '../../../outbound';
import { ItemMapper } from '../mappers/item.mapper';

@Injectable()
export class ItemCreateRepository implements IItemCreateRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get items(): Repository<Item> {
    return this.txHost.tx.getRepository(Item);
  }

  public existsBySku(sku: string): Promise<boolean> {
    return this.items.exists({ where: { sku } });
  }

  public async insert(item: ItemModel): Promise<ItemModel> {
    const { sku, name, ownerId, status, version } = item;

    try {
      await this.items.insert({ sku, name, ownerId, status, version });
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_SKU_TAKEN,
        `Item sku ${sku} is already registered`,
      );
    }

    const stored = await this.items.findOneOrFail({ where: { sku } });

    return ItemMapper.toModel(stored);
  }
}
