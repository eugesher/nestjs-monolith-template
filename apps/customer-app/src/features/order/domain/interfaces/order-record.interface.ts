export interface IOrderRecord {
  id: string;
  createdAt: Date;
  orderProducts: {
    id: string;
    productId: string;
    product: { sku: string; name: string };
  }[];
}
