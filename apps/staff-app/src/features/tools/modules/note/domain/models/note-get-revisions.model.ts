import type { INoteGetRevisionsRecordInput, INoteGetRevisionsSnapshotOutput } from '../interfaces';

export class NoteGetRevisionsModel {
  private constructor(
    public readonly id: string,
    public readonly noteId: string,
    public readonly noteVersion: number,
    public readonly bodyBefore: string,
    public readonly bodyAfter: string,
    public readonly editorId: string,
    public readonly correlationId: string,
    public readonly recordedAt: Date,
  ) {}

  public static reconstitute(record: INoteGetRevisionsRecordInput): NoteGetRevisionsModel {
    const { id, noteId, noteVersion, bodyBefore, bodyAfter, editorId, correlationId, recordedAt } =
      record;

    return new NoteGetRevisionsModel(
      id,
      noteId,
      noteVersion,
      bodyBefore,
      bodyAfter,
      editorId,
      correlationId,
      recordedAt,
    );
  }

  public static toViewData(
    records: INoteGetRevisionsRecordInput[],
  ): INoteGetRevisionsSnapshotOutput[] {
    return records.map((record) => {
      const revision = NoteGetRevisionsModel.reconstitute(record);

      return revision.toSnapshot();
    });
  }

  public toSnapshot(): INoteGetRevisionsSnapshotOutput {
    return {
      id: this.id,
      noteId: this.noteId,
      noteVersion: this.noteVersion,
      bodyBefore: this.bodyBefore,
      bodyAfter: this.bodyAfter,
      editorId: this.editorId,
      correlationId: this.correlationId,
      recordedAt: this.recordedAt.toISOString(),
    };
  }
}
