import { IPage } from '@acme-libs/toolkit';

interface ICatalogProductListViewItem {
  id: string;
  sku: string;
  name: string;
}

export type ICatalogProductListView = IPage<ICatalogProductListViewItem>;
