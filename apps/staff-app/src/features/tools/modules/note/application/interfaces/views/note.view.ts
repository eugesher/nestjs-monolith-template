export interface INoteView {
  id: string;
  subjectType: string;
  subjectId: string;
  body: string;
  authorId: string;
  resolved: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}
