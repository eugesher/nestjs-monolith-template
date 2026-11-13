import type { ITagGetManyRecordInput, ITagGetManySnapshotOutput } from '../interfaces';

export class TagGetManyModel {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static reconstitute(record: ITagGetManyRecordInput): TagGetManyModel {
    const { id, name, createdAt, updatedAt } = record;

    return new TagGetManyModel(id, name, createdAt, updatedAt);
  }

  public static toViewData(records: ITagGetManyRecordInput[]): ITagGetManySnapshotOutput[] {
    return records.map((record) => {
      const tag = TagGetManyModel.reconstitute(record);

      return tag.toSnapshot();
    });
  }

  public toSnapshot(): ITagGetManySnapshotOutput {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
