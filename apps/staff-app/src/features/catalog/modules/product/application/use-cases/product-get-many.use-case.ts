import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type IPage, type Maybe } from '@acme-libs/toolkit';

import { ProductGetManyModel } from '../../domain';
import {
  PRODUCT_GET_MANY_REPOSITORY_PORT,
  PRODUCT_TAG_PORT,
  type IProductGetManyRepositoryPort,
  type IProductTagPort,
} from '../../outbound';
import type { IProductGetManyCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductGetManyUseCase {
  constructor(
    @Inject(PRODUCT_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IProductGetManyRepositoryPort,
    @Inject(PRODUCT_TAG_PORT)
    private readonly tag: IProductTagPort,
  ) {}

  public async execute(command: IProductGetManyCommand): Promise<IPage<IProductView>> {
    const { tagId } = command;
    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const productIds = await this.findProductIds(tagId);

    if (productIds?.length === 0) {
      return PaginationHelper.toPage({ data: [], page, limit, total: 0 });
    }

    const [records, total] = await this.repository.list({ limit, offset, productIds });
    const data = ProductGetManyModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }

  private async findProductIds(tagId: Maybe<string>): Promise<Maybe<string[]>> {
    if (tagId === undefined) {
      return undefined;
    }

    return await this.tag.findProductIds({ tagId });
  }
}
