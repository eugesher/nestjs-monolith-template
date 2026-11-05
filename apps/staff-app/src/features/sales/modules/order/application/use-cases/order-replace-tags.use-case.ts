import { Inject, Injectable } from '@nestjs/common';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import { OrderNotFoundException, OrderTagNotFoundException } from '../../domain';
import {
  type IOrderReplaceTagsRepositoryPort,
  type IOrderTagPort,
  ORDER_REPLACE_TAGS_REPOSITORY_PORT,
  ORDER_TAG_PORT,
} from '../../outbound';
import { IOrderReplaceTagsCommand, IOrderTagsView } from '../interfaces';

@Injectable()
export class OrderReplaceTagsUseCase {
  constructor(
    @Inject(ORDER_REPLACE_TAGS_REPOSITORY_PORT)
    private readonly repository: IOrderReplaceTagsRepositoryPort,
    @Inject(ORDER_TAG_PORT)
    private readonly tag: IOrderTagPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
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

      if (outcome === 'tag-not-found') {
        throw new OrderTagNotFoundException(missingTagIds);
      }

      return { tags };
    });
  }
}
