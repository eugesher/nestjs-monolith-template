import { Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/database';

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

      if (outcome === OrderTagReplaceOutcomeEnum.TAG_NOT_FOUND) {
        throw new OrderTagNotFoundException(missingTagIds);
      }

      return { tags };
    });
  }
}
