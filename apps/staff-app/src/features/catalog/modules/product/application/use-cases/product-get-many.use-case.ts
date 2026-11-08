import { Inject, Injectable } from '@nestjs/common';

import { IPage, Maybe, PaginationHelper } from '@acme-libs/toolkit';

import { ProductModel } from '../../domain';
import {
  PRODUCT_GET_MANY_REPOSITORY_PORT,
  PRODUCT_TAG_PORT,
  type IProductGetManyRepositoryPort,
  type IProductTagPort,
} from '../../outbound';
import { IProductGetManyCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductGetManyUseCase {
  constructor(
    @Inject(PRODUCT_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IProductGetManyRepositoryPort,
    @Inject(PRODUCT_TAG_PORT)
    private readonly tag: IProductTagPort,
  ) {}

  public async execute(command: IProductGetManyCommand): Promise<IPage<IProductView>> {
    const { page, limit, tagId } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const productIds = await this.findProductIds(tagId);

    if (productIds?.length === 0) {
      return PaginationHelper.toPage([], 0, pageWindow);
    }

    const [records, total] = await this.repository.list({ ...pageWindow, productIds });
    const data = records.map((record) => {
      const product = ProductModel.reconstitute(record);

      return product.toSnapshot();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }

  private async findProductIds(tagId: Maybe<string>): Promise<Maybe<string[]>> {
    if (tagId === undefined) {
      return undefined;
    }

    return await this.tag.findProductIds({ tagId });
  }
}
