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
    const { page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const result = await this.repository.list(pageWindow);
    const data = result.data.map((order) => OrderViewMapper.toGetManyViewItem(order));

    return { ...result, data };
  }
}
