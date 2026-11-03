interface IOrderFoundRecordProduct {
  sku: string;
  name: string;
}

interface IOrderFoundRecordOrderProduct {
  id: string;
  productId: string;
  product: IOrderFoundRecordProduct;
}

export interface IOrderFoundRecord {
  id: string;
  customerId: string;
  createdAt: Date;
  orderProducts: IOrderFoundRecordOrderProduct[];
}
