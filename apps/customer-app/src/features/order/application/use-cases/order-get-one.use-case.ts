import { Inject, Injectable } from '@nestjs/common';

import { OrderModel, OrderNotFoundException } from '../../domain';
import { type IOrderGetOneRepositoryPort, ORDER_GET_ONE_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetOneCommand, IOrderView } from '../interfaces';

@Injectable()
export class OrderGetOneUseCase {
  constructor(
    @Inject(ORDER_GET_ONE_REPOSITORY_PORT)
    private readonly repository: IOrderGetOneRepositoryPort,
  ) {}

  public async execute(command: IOrderGetOneCommand): Promise<IOrderView> {
    const { customerId, orderId } = command;
    const record = await this.repository.findOwned({ orderId, customerId });

    if (!record) {
      throw new OrderNotFoundException(orderId);
    }

    const order = OrderModel.reconstitute(record);

    return order.toView();
  }
}
