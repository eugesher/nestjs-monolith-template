import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { type IProductCrudRepositoryPort, PRODUCT_CRUD_REPOSITORY_PORT } from '../../outbound';
import { IProductGetManyQuery, IProductView } from '../interfaces';

@Injectable()
export class ProductGetManyUseCase {
  constructor(
    @Inject(PRODUCT_CRUD_REPOSITORY_PORT)
    private readonly repository: IProductCrudRepositoryPort,
  ) {}

  public async execute(query: IProductGetManyQuery): Promise<IPage<IProductView>> {
    const { page, size } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({ ...window });
    const items = result.items.map((product) => product.toView());

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
