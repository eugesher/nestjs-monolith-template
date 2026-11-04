import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { ProductModel } from '../../domain';
import {
  type IProductGetManyRepositoryPort,
  PRODUCT_GET_MANY_REPOSITORY_PORT,
} from '../../outbound';
import { IProductGetManyCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductGetManyUseCase {
  constructor(
    @Inject(PRODUCT_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IProductGetManyRepositoryPort,
  ) {}

  public async execute(command: IProductGetManyCommand): Promise<IPage<IProductView>> {
    const { page, limit } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [records, total] = await this.repository.list({ ...pageWindow });
    const data = records.map((record) => {
      const product = ProductModel.reconstitute(record);

      return product.toView();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
