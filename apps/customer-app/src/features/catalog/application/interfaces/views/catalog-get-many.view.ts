import { IPage } from '@acme-libs/toolkit';

interface ICatalogGetManyViewItem {
  id: string;
  sku: string;
  name: string;
}

export type ICatalogGetManyView = IPage<ICatalogGetManyViewItem>;
