import { AppE2EContext } from '../../context/app-e2e.context';
import { ProductStockE2E } from './modules/product-stock.e2e';

export class WarehouseE2E {
  private constructor(private readonly productStockE2E: ProductStockE2E) {}

  public static of(ctx: AppE2EContext): WarehouseE2E {
    return new WarehouseE2E(ProductStockE2E.of(ctx));
  }

  public execute(): void {
    describe('ProductStock', () => {
      this.productStockE2E.handleAdd();
    });
  }
}
