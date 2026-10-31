import { Injectable } from '@nestjs/common';

import { IProductGetOneQuery, IProductView } from '../interfaces';
import { ProductViewMapper } from '../mappers/product-view.mapper';
import { ProductAccessService } from '../services/product-access.service';

@Injectable()
export class ProductGetOneUseCase {
  constructor(private readonly accessService: ProductAccessService) {}

  public async execute(query: IProductGetOneQuery): Promise<IProductView> {
    const { productId } = query;
    const product = await this.accessService.load({ productId });

    return ProductViewMapper.toView(product);
  }
}
