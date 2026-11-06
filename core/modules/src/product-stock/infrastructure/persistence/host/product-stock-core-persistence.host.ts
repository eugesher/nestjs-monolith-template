import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Product, ProductStock } from '@acme-core/entities';
import { ProductStockCorePersistenceProductBuilder } from '../builders/product-stock-core-persistence-product.builder';
import { ProductStockCorePersistenceBuilder } from '../builders/product-stock-core-persistence.builder';

export abstract class ProductStockCorePersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  protected get productStockRepository(): IHostedRepository<ProductStock> {
    return this.repositoryHost.getRepository(ProductStock);
  }

  protected createProductBuilder(): ProductStockCorePersistenceProductBuilder {
    return new ProductStockCorePersistenceProductBuilder(
      this.productRepository.createQueryBuilder(Product.name),
    );
  }

  protected createProductStockBuilder(): ProductStockCorePersistenceBuilder {
    return new ProductStockCorePersistenceBuilder(
      this.productStockRepository.createQueryBuilder(ProductStock.name),
    );
  }
}
