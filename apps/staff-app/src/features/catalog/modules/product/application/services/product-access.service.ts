import { Inject, Injectable } from '@nestjs/common';

import { ProductModel, ProductNotFoundException } from '../../domain';
import { PRODUCT_ACCESS_REPOSITORY_PORT, type IProductAccessRepositoryPort } from '../../outbound';
import type { IProductAccessLoadCommand } from '../interfaces';

@Injectable()
export class ProductAccessService {
  constructor(
    @Inject(PRODUCT_ACCESS_REPOSITORY_PORT)
    private readonly repository: IProductAccessRepositoryPort,
  ) {}

  public async load(command: IProductAccessLoadCommand): Promise<ProductModel> {
    const { productId } = command;
    const productRecord = await this.repository.findById(productId);

    if (!productRecord) {
      throw new ProductNotFoundException(productId);
    }

    return ProductModel.reconstitute(productRecord);
  }
}
