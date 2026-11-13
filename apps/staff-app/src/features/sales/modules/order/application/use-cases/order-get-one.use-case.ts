import { Inject, Injectable } from '@nestjs/common';

import { OrderModel, OrderNotFoundException } from '../../domain';
import { ORDER_GET_ONE_REPOSITORY_PORT, type IOrderGetOneRepositoryPort } from '../../outbound';
import type { IOrderGetOneCommand, IOrderGetOneView } from '../interfaces';

@Injectable()
export class OrderGetOneUseCase {
  constructor(
    @Inject(ORDER_GET_ONE_REPOSITORY_PORT)
    private readonly repository: IOrderGetOneRepositoryPort,
  ) {}

  public async execute(command: IOrderGetOneCommand): Promise<IOrderGetOneView> {
    const { orderId } = command;
    const orderRecord = await this.repository.findById(orderId);

    if (!orderRecord) {
      throw new OrderNotFoundException(orderId);
    }

    const order = OrderModel.reconstitute(orderRecord);

    return order.toSnapshot();
  }
}
