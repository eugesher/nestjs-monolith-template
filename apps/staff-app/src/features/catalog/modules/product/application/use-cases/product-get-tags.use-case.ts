import { Inject, Injectable } from '@nestjs/common';

import { type IProductTagPort, PRODUCT_TAG_PORT } from '../../outbound';
import { IProductGetTagsCommand, IProductTagsView } from '../interfaces';
import { ProductAccessService } from '../services/product-access.service';

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
