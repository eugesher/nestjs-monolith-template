import { Product } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { CatalogPersistenceProductBuilder } from '../builders/catalog-persistence-product.builder';

export abstract class CatalogPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.orm.getRepository(Product);
  }

  protected createProductBuilder(): CatalogPersistenceProductBuilder {
    return new CatalogPersistenceProductBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }
}
