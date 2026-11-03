interface IOrderPlacedRecordProduct {
  sku: string;
  name: string;
}

interface IOrderPlacedRecordOrderProduct {
  id: string;
  productId: string;
  product: IOrderPlacedRecordProduct;
}

export interface IOrderPlacedRecord {
  id: string;
  customerId: string;
  createdAt: Date;
  orderProducts: IOrderPlacedRecordOrderProduct[];
}
