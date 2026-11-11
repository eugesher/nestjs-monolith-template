import { Injectable } from '@nestjs/common';

import { ProductAccessService } from '../services/product-access.service';
import type { IProductGetOneCommand, IProductView } from '../interfaces';

@Injectable()
export class ProductGetOneUseCase {
  constructor(private readonly accessService: ProductAccessService) {}

  public async execute(command: IProductGetOneCommand): Promise<IProductView> {
    const { productId } = command;
    const product = await this.accessService.load({ productId });

    return product.toSnapshot();
  }
}
