import { Inject, Injectable } from '@nestjs/common';

import { OrderModel, OrderNotFoundException } from '../../domain';
import { type IOrderGetOneRepositoryPort, ORDER_GET_ONE_REPOSITORY_PORT } from '../../outbound';
import { IOrderGetOneQuery, IOrderView } from '../interfaces';

@Injectable()
export class OrderGetOneUseCase {
  constructor(
    @Inject(ORDER_GET_ONE_REPOSITORY_PORT)
    private readonly repository: IOrderGetOneRepositoryPort,
  ) {}

  public async execute(query: IOrderGetOneQuery): Promise<IOrderView> {
    const { customerId, orderId } = query;
    const record = await this.repository.findOwned({ orderId, customerId });

    if (!record) {
      throw new OrderNotFoundException(orderId);
    }

    const order = OrderModel.reconstitute(record);

    return order.toView();
  }
}
