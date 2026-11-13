import type { IOrderGetManyRecordInput, IOrderGetManySnapshotOutput } from '../interfaces';

export class OrderGetManyModel {
  private constructor(
    public readonly id: string,
    public readonly createdAt: Date,
  ) {}

  public static reconstitute(record: IOrderGetManyRecordInput): OrderGetManyModel {
    const { id, createdAt } = record;

    return new OrderGetManyModel(id, createdAt);
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
      createdAt: this.createdAt.toISOString(),
    };
  }
}
