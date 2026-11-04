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
    const { customerId, page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [orders, total] = await this.repository.list({ ...pageWindow, customerId });
    const data = orders.map((order) => OrderViewMapper.toSummaryView(order));

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
