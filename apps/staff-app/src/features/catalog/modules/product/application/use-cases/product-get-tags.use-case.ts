import { Inject, Injectable } from '@nestjs/common';

import { PRODUCT_TAG_PORT, type IProductTagPort } from '../../outbound';
import { ProductAccessService } from '../services/product-access.service';
import type { IProductGetTagsCommand, IProductTagsView } from '../interfaces';

@Injectable()
export class ProductGetTagsUseCase {
  constructor(
    private readonly accessService: ProductAccessService,
    @Inject(PRODUCT_TAG_PORT)
    private readonly tag: IProductTagPort,
  ) {}

  public async execute(command: IProductGetTagsCommand): Promise<IProductTagsView> {
    const { productId } = command;

    await this.accessService.load({ productId });

    const tags = await this.tag.find({ productId });

    return { tags };
  }
}
