import { AppE2EContext } from '../../context/app-e2e.context';
import { ProductE2E } from './modules/product.e2e';

export class CatalogE2E {
  private constructor(private readonly productE2E: ProductE2E) {}

  public static of(ctx: AppE2EContext): CatalogE2E {
    return new CatalogE2E(ProductE2E.of(ctx));
  }

  public execute(): void {
    describe('Product', () => {
      this.productE2E.handleGetMany();
      this.productE2E.handleGetOne();
      this.productE2E.handleCreate();
      this.productE2E.handleRename();
      this.productE2E.handleArchive();
      this.productE2E.handleRestock();
    });
  }
}
