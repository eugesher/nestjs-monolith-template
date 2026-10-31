import { Inject, Injectable } from '@nestjs/common';

import { OrderDomainException, OrderErrorCodeEnum } from '../../domain';
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
    const { orderId } = query;
    const order = await this.repository.findById(orderId);

    if (order === null) {
      throw new OrderDomainException(
        OrderErrorCodeEnum.ORDER_NOT_FOUND,
        `Order ${orderId} was not found`,
      );
    }

    return OrderViewMapper.toView(order);
  }
}
