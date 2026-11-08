import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';

import { ProductStockPersistenceProductBuilder } from '../builders/product-stock-persistence-product.builder';

export abstract class ProductStockPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.orm.getRepository(Product);
  }

  protected createProductBuilder(): ProductStockPersistenceProductBuilder {
    return new ProductStockPersistenceProductBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }
}
