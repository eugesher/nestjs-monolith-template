export interface IOrderProductRecord {
  id: string;
  productId: string;
  product: {
    sku: string;
    name: string;
  };
}
