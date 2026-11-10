import { IOrderSummaryRecordInput, IOrderSummarySnapshotOutput } from '../interfaces';

export class OrderSummaryModel {
  private constructor(
    public readonly id: string,
    public readonly createdAt: Date,
  ) {}

  public static reconstitute(record: IOrderSummaryRecordInput): OrderSummaryModel {
    const { id, createdAt } = record;

    return new OrderSummaryModel(id, createdAt);
  }

  public toSnapshot(): IOrderSummarySnapshotOutput {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
