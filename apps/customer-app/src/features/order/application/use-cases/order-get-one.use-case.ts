import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundException } from '../../domain';
import { type IOrderCrudRepositoryPort, ORDER_CRUD_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetOneQuery, IOrderView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetOneUseCase {
  constructor(
    @Inject(ORDER_CRUD_REPOSITORY_PORT)
    private readonly repository: IOrderCrudRepositoryPort,
  ) {}

  public async execute(query: IOrderGetOneQuery): Promise<IOrderView> {
    const { customerId, orderId } = query;
    const order = await this.repository.findOwned({ orderId, customerId });

    if (order === null) {
      throw new OrderNotFoundException(orderId);
    }

    return OrderViewMapper.toView(order);
  }
}
