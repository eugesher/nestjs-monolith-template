import { Inject, Injectable } from '@nestjs/common';

import { OrderNotFoundException } from '../../domain';
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
    const order = await this.repository.findOwned({ orderId, customerId });

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    return order.toView();
  }
}
