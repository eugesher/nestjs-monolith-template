import { IOrderSummaryRecordInput, IOrderSummarySnapshotOutput } from '../interfaces';

export class OrderSummaryModel {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly createdAt: Date,
  ) {}

  public static reconstitute(record: IOrderSummaryRecordInput): OrderSummaryModel {
    const { id, customerId, createdAt } = record;

    return new OrderSummaryModel(id, customerId, createdAt);
  }

  public toSnapshot(): IOrderSummarySnapshotOutput {
    return {
      id: this.id,
      customerId: this.customerId,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
