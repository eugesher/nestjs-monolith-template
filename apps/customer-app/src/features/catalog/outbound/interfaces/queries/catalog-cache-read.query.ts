import { IPage } from '@acme-libs/toolkit';
import { ICatalogProductStockView } from '../views/catalog-product-stock.view';

export interface ICatalogCacheReadQuery {
  page: number;
  size: number;
  compute: () => Promise<IPage<ICatalogProductStockView>>;
}
