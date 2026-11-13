export interface INoteGetManyRecordInput {
  id: string;
  subjectType: string;
  subjectId: string;
  body: string;
  authorId: string;
  resolved: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
