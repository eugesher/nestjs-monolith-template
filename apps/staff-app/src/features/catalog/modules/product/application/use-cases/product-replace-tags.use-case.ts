import { Inject, Injectable } from '@nestjs/common';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { ProductNotFoundException, ProductTagNotFoundException } from '../../domain';
import {
  PRODUCT_REPLACE_TAGS_REPOSITORY_PORT,
  PRODUCT_TAG_PORT,
  ProductTagReplaceOutcomeEnum,
  type IProductReplaceTagsRepositoryPort,
  type IProductTagPort,
} from '../../outbound';
import { IProductReplaceTagsCommand, IProductTagsView } from '../interfaces';

@Injectable()
export class ProductReplaceTagsUseCase {
  constructor(
    @Inject(PRODUCT_REPLACE_TAGS_REPOSITORY_PORT)
    private readonly repository: IProductReplaceTagsRepositoryPort,
    @Inject(PRODUCT_TAG_PORT)
    private readonly tag: IProductTagPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
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
