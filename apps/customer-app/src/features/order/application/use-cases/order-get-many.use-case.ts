import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { type IOrderGetManyRepositoryPort, ORDER_GET_MANY_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetManyCommand, IOrderGetManyView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetManyUseCase {
  constructor(
    @Inject(ORDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IOrderGetManyRepositoryPort,
  ) {}

  public async execute(command: IOrderGetManyCommand): Promise<IOrderGetManyView> {
    const { customerId, page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [orders, total] = await this.repository.list({ ...pageWindow, customerId });
    const data = orders.map((order) => OrderViewMapper.toGetManyViewItem(order));

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
