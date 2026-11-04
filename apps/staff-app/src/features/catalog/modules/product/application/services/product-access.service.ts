import { Inject, Injectable } from '@nestjs/common';

import { ProductModel, ProductNotFoundException } from '../../domain';
import { type IProductAccessRepositoryPort, PRODUCT_ACCESS_REPOSITORY_PORT } from '../../outbound';
import { IProductAccessLoadCommand } from '../interfaces';

@Injectable()
export class ProductAccessService {
  constructor(
    @Inject(PRODUCT_ACCESS_REPOSITORY_PORT)
    private readonly repository: IProductAccessRepositoryPort,
  ) {}

  public async load(command: IProductAccessLoadCommand): Promise<ProductModel> {
    const { productId } = command;
    const record = await this.repository.findById(productId);

    if (!record) {
      throw new ProductNotFoundException(productId);
    }

    return ProductModel.reconstitute(record);
  }
}
