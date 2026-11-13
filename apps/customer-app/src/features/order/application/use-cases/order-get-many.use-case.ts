import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { OrderGetManyModel } from '../../domain';
import { ORDER_GET_MANY_REPOSITORY_PORT, type IOrderGetManyRepositoryPort } from '../../outbound';
import type { IOrderGetManyCommand, IOrderGetManyView } from '../interfaces';

@Injectable()
export class OrderGetManyUseCase {
  constructor(
    @Inject(ORDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IOrderGetManyRepositoryPort,
  ) {}

  public async execute(command: IOrderGetManyCommand): Promise<IOrderGetManyView> {
    const { customerId } = command;
    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [records, total] = await this.repository.list({ limit, offset, customerId });
    const data = OrderGetManyModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
