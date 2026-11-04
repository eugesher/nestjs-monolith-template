import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundException } from '../../domain';
import { type IOrderGetOneRepositoryPort, ORDER_GET_ONE_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetOneCommand, IOrderView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetOneUseCase {
  constructor(
    @Inject(ORDER_GET_ONE_REPOSITORY_PORT)
    private readonly repository: IOrderGetOneRepositoryPort,
  ) {}

  public async execute(command: IOrderGetOneCommand): Promise<IOrderView> {
    const { orderId } = command;
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    return OrderViewMapper.toView(order);
  }
}
