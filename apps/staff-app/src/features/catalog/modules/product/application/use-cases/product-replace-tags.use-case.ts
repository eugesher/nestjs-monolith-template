import { Inject, Injectable } from '@nestjs/common';

import { ProductNotFoundException, ProductTagNotFoundException } from '../../domain';
import {
  PRODUCT_REPLACE_TAGS_REPOSITORY_PORT,
  PRODUCT_TAG_PORT,
  PRODUCT_TRANSACTION_PORT,
  ProductTagReplaceOutcomeEnum,
  type IProductReplaceTagsRepositoryPort,
  type IProductTagPort,
  type IProductTransactionPort,
} from '../../outbound';
import { IProductReplaceTagsCommand, IProductTagsView } from '../interfaces';

@Injectable()
export class ProductReplaceTagsUseCase {
  constructor(
    @Inject(PRODUCT_REPLACE_TAGS_REPOSITORY_PORT)
    private readonly repository: IProductReplaceTagsRepositoryPort,
    @Inject(PRODUCT_TAG_PORT)
    private readonly tag: IProductTagPort,
    @Inject(PRODUCT_TRANSACTION_PORT)
    private readonly transaction: IProductTransactionPort,
  ) {}

  public async execute(command: IProductReplaceTagsCommand): Promise<IProductTagsView> {
    return await this.transaction.run(async () => {
      const { productId, tagIds } = command;
      const product = await this.repository.lockById(productId);

      if (!product) {
        throw new ProductNotFoundException(productId);
      }

      const replaced = await this.tag.replace({ productId, tagIds });
      const { outcome, tags, missingTagIds } = replaced;

      if (outcome === ProductTagReplaceOutcomeEnum.TAG_NOT_FOUND) {
        throw new ProductTagNotFoundException(missingTagIds);
      }

      return { tags };
    });
  }
}
