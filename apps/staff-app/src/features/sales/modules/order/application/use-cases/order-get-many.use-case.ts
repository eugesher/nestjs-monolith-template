import { Inject, Injectable } from '@nestjs/common';

import { Maybe, PaginationHelper } from '@acme-libs/toolkit';

import {
  type IOrderGetManyRepositoryPort,
  type IOrderTagPort,
  ORDER_GET_MANY_REPOSITORY_PORT,
  ORDER_TAG_PORT,
} from '../../outbound';
import { IOrderGetManyCommand, IOrderGetManyView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetManyUseCase {
  constructor(
    @Inject(ORDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IOrderGetManyRepositoryPort,
    @Inject(ORDER_TAG_PORT)
    private readonly tag: IOrderTagPort,
  ) {}

  public async execute(command: IOrderGetManyCommand): Promise<IOrderGetManyView> {
    const { page, limit, tagId } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const orderIds = await this.findOrderIds(tagId);

    if (orderIds?.length === 0) {
      return PaginationHelper.toPage([], 0, pageWindow);
    }

    const [orders, total] = await this.repository.list({ ...pageWindow, orderIds });
    const data = orders.map((order) => OrderViewMapper.toGetManyViewItem(order));

    return PaginationHelper.toPage(data, total, pageWindow);
  }

  private async findOrderIds(tagId: Maybe<string>): Promise<Maybe<string[]>> {
    if (tagId === undefined) {
      return undefined;
    }

    return await this.tag.findOrderIds({ tagId });
  }
}
