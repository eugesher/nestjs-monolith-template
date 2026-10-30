export interface IOrderProductStockWithdrawCommand {
  movements: { productId: string; orderProductId: string }[];
}
