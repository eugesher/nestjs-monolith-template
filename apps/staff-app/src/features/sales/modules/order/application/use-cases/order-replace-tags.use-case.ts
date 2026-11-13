import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundException, OrderTagNotFoundException } from '../../domain';
import {
  ORDER_REPLACE_TAGS_REPOSITORY_PORT,
  ORDER_TAG_PORT,
  ORDER_TRANSACTION_PORT,
  OrderTagReplaceOutcomeEnum,
  type IOrderReplaceTagsRepositoryPort,
  type IOrderTagPort,
  type IOrderTransactionPort,
} from '../../outbound';
import type { IOrderReplaceTagsCommand, IOrderTagsView } from '../interfaces';

@Injectable()
export class OrderReplaceTagsUseCase {
  constructor(
    @Inject(ORDER_REPLACE_TAGS_REPOSITORY_PORT)
    private readonly repository: IOrderReplaceTagsRepositoryPort,
    @Inject(ORDER_TAG_PORT)
    private readonly tag: IOrderTagPort,
    @Inject(ORDER_TRANSACTION_PORT)
    private readonly transaction: IOrderTransactionPort,
  ) {}

  public async execute(command: IOrderReplaceTagsCommand): Promise<IOrderTagsView> {
    return await this.transaction.run(async () => {
      const { orderId, tagIds } = command;
      const order = await this.repository.lockById(orderId);

      if (!order) {
        throw new OrderNotFoundException(orderId);
      }

      const replaceResult = await this.tag.replace({ orderId, tagIds });
      const { outcome, tags, missingTagIds } = replaceResult;

      if (outcome === OrderTagReplaceOutcomeEnum.TAG_NOT_FOUND) {
        throw new OrderTagNotFoundException(missingTagIds);
      }

      return { tags };
    });
  }
}
