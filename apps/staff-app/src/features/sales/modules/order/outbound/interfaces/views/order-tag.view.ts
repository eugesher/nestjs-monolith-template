export interface IOrderTagFindView {
  id: string;
  name: string;
}

export interface IOrderTagReplaceView {
  outcome: 'replaced' | 'tag-not-found';
  tags: IOrderTagFindView[];
  missingTagIds: string[];
}
