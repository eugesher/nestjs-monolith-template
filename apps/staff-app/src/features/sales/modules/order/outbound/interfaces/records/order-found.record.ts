interface IOrderFoundRecordProduct {
  id: string;
  productId: string;
  sku: string;
  name: string;
}

export interface IOrderFoundRecord {
  id: string;
  customerId: string;
  createdAt: Date;
  products: IOrderFoundRecordProduct[];
}
