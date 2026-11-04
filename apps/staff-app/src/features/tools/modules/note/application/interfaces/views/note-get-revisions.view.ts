import { IPage } from '@acme-libs/toolkit';

interface INoteGetRevisionsViewItem {
  id: string;
  noteId: string;
  noteVersion: number;
  bodyBefore: string;
  bodyAfter: string;
  editorId: string;
  correlationId: string;
  recordedAt: string;
}

export type INoteGetRevisionsView = IPage<INoteGetRevisionsViewItem>;
