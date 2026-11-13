export interface INoteGetRevisionsSnapshotOutput {
  id: string;
  noteId: string;
  noteVersion: number;
  bodyBefore: string;
  bodyAfter: string;
  editorId: string;
  correlationId: string;
  recordedAt: string;
}
