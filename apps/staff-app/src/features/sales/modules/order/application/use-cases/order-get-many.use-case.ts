import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { type IOrderGetManyRepositoryPort, ORDER_GET_MANY_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetManyCommand, IOrderSummaryView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetManyUseCase {
  constructor(
    @Inject(ORDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IOrderGetManyRepositoryPort,
  ) {}

  public async execute(command: IOrderGetManyCommand): Promise<IPage<IOrderSummaryView>> {
    const { page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const result = await this.repository.list(pageWindow);
    const data = result.data.map((order) => OrderViewMapper.toSummaryView(order));

    return { ...result, data };
  }
}
