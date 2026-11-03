interface IOrderFoundViewProduct {
  id: string;
  productId: string;
  sku: string;
  name: string;
}

export interface IOrderFoundView {
  id: string;
  customerId: string;
  createdAt: Date;
  products: IOrderFoundViewProduct[];
}
