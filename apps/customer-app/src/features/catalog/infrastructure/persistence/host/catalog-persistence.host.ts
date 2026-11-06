import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';
import { CatalogPersistenceProductBuilder } from '../builders/catalog-persistence-product.builder';

export abstract class CatalogPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  protected createProductBuilder(): CatalogPersistenceProductBuilder {
    return new CatalogPersistenceProductBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }
}
