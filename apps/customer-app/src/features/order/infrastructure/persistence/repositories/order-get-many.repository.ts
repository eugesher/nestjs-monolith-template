import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IOrderGetManyRepositoryPort,
  IOrderGetManyRecord,
  IOrderGetManyQuery,
} from '../../../outbound';
import { OrderRepositoryHost } from '../host/order.repository.host';

@Injectable()
export class OrderGetManyRepository
  extends OrderRepositoryHost
  implements IOrderGetManyRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: IOrderGetManyQuery): Promise<IOrderGetManyRecord> {
    return await this.createOrderBuilder().forList(query).getManyAndCount();
  }
}
