import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { OrderSummaryModel } from '../../domain';
import { ORDER_GET_MANY_REPOSITORY_PORT, type IOrderGetManyRepositoryPort } from '../../outbound';
import type { IOrderGetManyCommand, IOrderGetManyView } from '../interfaces';

@Injectable()
export class OrderGetManyUseCase {
  constructor(
    @Inject(ORDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IOrderGetManyRepositoryPort,
  ) {}

  public async execute(command: IOrderGetManyCommand): Promise<IOrderGetManyView> {
    const { customerId, page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [records, total] = await this.repository.list({ ...pageWindow, customerId });
    const data = records.map((record) => {
      const order = OrderSummaryModel.reconstitute(record);

      return order.toSnapshot();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
