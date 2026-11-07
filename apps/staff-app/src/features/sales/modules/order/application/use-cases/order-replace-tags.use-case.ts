import { Inject, Injectable } from '@nestjs/common';

import {
  LOCAL_STORAGE_TRANSACTION,
  type ILocalStorageTransaction,
} from '@acme-libs/contracts/local-storage';

import { OrderNotFoundException, OrderTagNotFoundException } from '../../domain';
import {
  ORDER_REPLACE_TAGS_REPOSITORY_PORT,
  ORDER_TAG_PORT,
  OrderTagReplaceOutcomeEnum,
  type IOrderReplaceTagsRepositoryPort,
  type IOrderTagPort,
} from '../../outbound';
import { IOrderReplaceTagsCommand, IOrderTagsView } from '../interfaces';

@Injectable()
export class OrderReplaceTagsUseCase {
  constructor(
    @Inject(ORDER_REPLACE_TAGS_REPOSITORY_PORT)
    private readonly repository: IOrderReplaceTagsRepositoryPort,
    @Inject(ORDER_TAG_PORT)
    private readonly tag: IOrderTagPort,
    @Inject(LOCAL_STORAGE_TRANSACTION)
    private readonly transaction: ILocalStorageTransaction,
  ) {}

  public async execute(command: IOrderReplaceTagsCommand): Promise<IOrderTagsView> {
    return await this.transaction.run(async () => {
      const { orderId, tagIds } = command;
      const order = await this.repository.lockById(orderId);

      if (!order) {
        throw new OrderNotFoundException(orderId);
      }

      const replaced = await this.tag.replace({ orderId, tagIds });
      const { outcome, tags, missingTagIds } = replaced;

      if (outcome === OrderTagReplaceOutcomeEnum.TAG_NOT_FOUND) {
        throw new OrderTagNotFoundException(missingTagIds);
      }

      return { tags };
    });
  }
}
