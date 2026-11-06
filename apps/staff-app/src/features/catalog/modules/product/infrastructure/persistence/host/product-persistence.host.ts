import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';
import { ProductPersistenceBuilder } from '../builders/product-persistence.builder';

export abstract class ProductPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  protected createProductBuilder(): ProductPersistenceBuilder {
    return new ProductPersistenceBuilder(this.productRepository.createQueryBuilder(Product.name));
  }
}
