import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type Maybe } from '@acme-libs/toolkit';

import { OrderGetManyModel } from '../../domain';
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
    const { tagId } = command;
    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const orderIds = await this.findOrderIds(tagId);

    if (orderIds?.length === 0) {
      return PaginationHelper.toPage({ data: [], page, limit, total: 0 });
    }

    const [records, total] = await this.repository.list({ limit, offset, orderIds });
    const data = OrderGetManyModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }

  private async findOrderIds(tagId: Maybe<string>): Promise<Maybe<string[]>> {
    if (tagId === undefined) {
      return undefined;
    }

    return await this.tag.findOrderIds({ tagId });
  }
}
