import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';

import { ProductCorePersistenceBuilder } from '../builders/product-core-persistence.builder';

export abstract class ProductCorePersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  protected createProductBuilder(): ProductCorePersistenceBuilder {
    return new ProductCorePersistenceBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }
}
