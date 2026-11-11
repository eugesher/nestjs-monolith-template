import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type Maybe } from '@acme-libs/toolkit';

import { OrderSummaryModel } from '../../domain';
import {
  ORDER_GET_MANY_REPOSITORY_PORT,
  ORDER_TAG_PORT,
  type IOrderGetManyRepositoryPort,
  type IOrderTagPort,
} from '../../outbound';
import type { IOrderGetManyCommand, IOrderGetManyView } from '../interfaces';

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

    const [records, total] = await this.repository.list({ ...pageWindow, orderIds });
    const data = records.map((record) => {
      const order = OrderSummaryModel.reconstitute(record);

      return order.toSnapshot();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }

  private async findOrderIds(tagId: Maybe<string>): Promise<Maybe<string[]>> {
    if (tagId === undefined) {
      return undefined;
    }

    return await this.tag.findOrderIds({ tagId });
  }
}
