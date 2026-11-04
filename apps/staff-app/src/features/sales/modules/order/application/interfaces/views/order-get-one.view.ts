interface IOrderGetOneViewProduct {
  id: string;
  productId: string;
  sku: string;
  name: string;
}

export interface IOrderGetOneView {
  id: string;
  customerId: string;
  createdAt: string;
  products: IOrderGetOneViewProduct[];
}
