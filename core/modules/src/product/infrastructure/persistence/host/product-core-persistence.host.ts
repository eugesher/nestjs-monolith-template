import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';

import { ProductCorePersistenceBuilder } from '../builders/product-core-persistence.builder';

export abstract class ProductCorePersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.orm.getRepository(Product);
  }

  protected createProductBuilder(): ProductCorePersistenceBuilder {
    return new ProductCorePersistenceBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }
}
