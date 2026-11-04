import { IPage } from '@acme-libs/toolkit';

export type ICatalogProductListView = IPage<{
  id: string;
  sku: string;
  name: string;
}>;
