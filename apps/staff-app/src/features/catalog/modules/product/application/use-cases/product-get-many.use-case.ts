import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import {
  type IProductGetManyRepositoryPort,
  PRODUCT_GET_MANY_REPOSITORY_PORT,
} from '../../outbound';
import { IProductGetManyQuery, IProductView } from '../interfaces';

@Injectable()
export class ProductGetManyUseCase {
  constructor(
    @Inject(PRODUCT_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IProductGetManyRepositoryPort,
  ) {}

  public async execute(query: IProductGetManyQuery): Promise<IPage<IProductView>> {
    const { page, size } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({ ...window });
    const data = result.data.map((product) => product.toView());

    return { ...result, data };
  }
}
