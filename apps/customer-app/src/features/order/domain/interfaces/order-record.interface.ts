interface IOrderRecordProduct {
  sku: string;
  name: string;
}

interface IOrderRecordOrderProduct {
  id: string;
  productId: string;
  product: IOrderRecordProduct;
}

export interface IOrderRecord {
  id: string;
  customerId: string;
  createdAt: Date;
  orderProducts: IOrderRecordOrderProduct[];
}
