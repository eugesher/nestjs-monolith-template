import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { type IOrderCrudRepositoryPort, ORDER_CRUD_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetManyQuery, IOrderSummaryView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetManyUseCase {
  constructor(
    @Inject(ORDER_CRUD_REPOSITORY_PORT)
    private readonly repository: IOrderCrudRepositoryPort,
  ) {}

  public async execute(query: IOrderGetManyQuery): Promise<IPage<IOrderSummaryView>> {
    const { customerId, page, size } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({ ...window, customerId });
    const items = result.items.map((order) => OrderViewMapper.toSummaryView(order));

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
