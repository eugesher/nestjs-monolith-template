import type { INoteGetManyRecordInput, INoteGetManySnapshotOutput } from '../interfaces';

export class NoteGetManyModel {
  private constructor(
    public readonly id: string,
    public readonly subjectType: string,
    public readonly subjectId: string,
    public readonly body: string,
    public readonly authorId: string,
    public readonly resolved: boolean,
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  public static reconstitute(record: INoteGetManyRecordInput): NoteGetManyModel {
    const { id, subjectType, subjectId, body, authorId, resolved, version, createdAt, updatedAt } =
      record;

    return new NoteGetManyModel(
      id,
      subjectType,
      subjectId,
      body,
      authorId,
      resolved,
      version,
      createdAt,
      updatedAt,
    );
  }

  public static toViewData(records: INoteGetManyRecordInput[]): INoteGetManySnapshotOutput[] {
    return records.map((record) => {
      const note = NoteGetManyModel.reconstitute(record);

      return note.toSnapshot();
    });
  }

  public toSnapshot(): INoteGetManySnapshotOutput {
    return {
      id: this.id,
      subjectType: this.subjectType,
      subjectId: this.subjectId,
      body: this.body,
      authorId: this.authorId,
      resolved: this.resolved,
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
