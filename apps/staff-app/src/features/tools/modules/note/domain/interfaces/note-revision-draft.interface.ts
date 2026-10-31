export interface INoteRevisionDraft {
  noteId: string;
  noteVersion: number;
  bodyBefore: string;
  bodyAfter: string;
  editorId: string;
  correlationId: string;
}
