import { Inject, Injectable } from '@nestjs/common';

import { ProductDomainException, ProductErrorCodeEnum, ProductModel } from '../../domain';
import { type IProductAccessRepositoryPort, PRODUCT_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { IProductAccessLoadQuery } from '../interfaces/queries/product-access-load.query';

@Injectable()
export class ProductAccessService {
  constructor(
    @Inject(PRODUCT_ACCESS_REPOSITORY_PORT)
    private readonly repository: IProductAccessRepositoryPort,
  ) {}

  public async load(query: IProductAccessLoadQuery): Promise<ProductModel> {
    const { productId } = query;
    const product = await this.repository.findById(productId);

    if (product === null) {
      throw new ProductDomainException(
        ProductErrorCodeEnum.PRODUCT_NOT_FOUND,
        `Product ${productId} was not found`,
      );
    }

    return product;
  }
}
