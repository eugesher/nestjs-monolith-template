import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { type IItemWriteRepositoryPort, IItemWriteUpdateCommand } from '../../../outbound';
import { ItemFindByIdBaseRepository } from './base/item-find-by-id-base.repository';

@Injectable()
export class ItemWriteRepository
  extends ItemFindByIdBaseRepository
  implements IItemWriteRepositoryPort
{
  constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(txHost);
  }

  public async update(command: IItemWriteUpdateCommand): Promise<boolean> {
    const { item, versionAsRead } = command;
    const result = await this.items.update(
      { id: item.id, version: versionAsRead },
      { name: item.name, status: item.status, version: item.version },
    );

    return result.affected === 1;
  }
}
