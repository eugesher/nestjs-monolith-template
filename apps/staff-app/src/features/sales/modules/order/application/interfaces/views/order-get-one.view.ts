export interface IOrderGetOneView {
  id: string;
  customerId: string;
  createdAt: string;
  products: {
    id: string;
    productId: string;
    sku: string;
    name: string;
  }[];
}
