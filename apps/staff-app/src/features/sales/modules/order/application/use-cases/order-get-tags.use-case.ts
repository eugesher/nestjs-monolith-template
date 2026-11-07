import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundException } from '../../domain';
import {
  ORDER_GET_TAGS_REPOSITORY_PORT,
  ORDER_TAG_PORT,
  type IOrderGetTagsRepositoryPort,
  type IOrderTagPort,
} from '../../outbound';
import { IOrderGetTagsCommand, IOrderTagsView } from '../interfaces';

@Injectable()
export class OrderGetTagsUseCase {
  constructor(
    @Inject(ORDER_GET_TAGS_REPOSITORY_PORT)
    private readonly repository: IOrderGetTagsRepositoryPort,
    @Inject(ORDER_TAG_PORT)
    private readonly tag: IOrderTagPort,
  ) {}

  public async execute(command: IOrderGetTagsCommand): Promise<IOrderTagsView> {
    const { orderId } = command;
    const order = await this.repository.findExisting(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    const tags = await this.tag.find({ orderId });

    return { tags };
  }
}
