import type { IOrderGetManyRecordInput, IOrderGetManySnapshotOutput } from '../interfaces';

export class OrderGetManyModel {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly createdAt: Date,
  ) {}

  public static reconstitute(record: IOrderGetManyRecordInput): OrderGetManyModel {
    const { id, customerId, createdAt } = record;

    return new OrderGetManyModel(id, customerId, createdAt);
  }

  public static toViewData(records: IOrderGetManyRecordInput[]): IOrderGetManySnapshotOutput[] {
    return records.map((record) => {
      const order = OrderGetManyModel.reconstitute(record);

      return order.toSnapshot();
    });
  }

  public toSnapshot(): IOrderGetManySnapshotOutput {
    return {
      id: this.id,
      customerId: this.customerId,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
