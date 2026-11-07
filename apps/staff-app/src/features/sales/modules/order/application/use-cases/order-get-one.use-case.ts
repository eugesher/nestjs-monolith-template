import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundException } from '../../domain';
import { ORDER_GET_ONE_REPOSITORY_PORT, type IOrderGetOneRepositoryPort } from '../../outbound';
import { IOrderGetOneCommand, IOrderGetOneView } from '../interfaces';
import { OrderViewMapper } from '../mappers/order-view.mapper';

@Injectable()
export class OrderGetOneUseCase {
  constructor(
    @Inject(ORDER_GET_ONE_REPOSITORY_PORT)
    private readonly repository: IOrderGetOneRepositoryPort,
  ) {}

  public async execute(command: IOrderGetOneCommand): Promise<IOrderGetOneView> {
    const { orderId } = command;
    const order = await this.repository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    return OrderViewMapper.toGetOneView(order);
  }
}
