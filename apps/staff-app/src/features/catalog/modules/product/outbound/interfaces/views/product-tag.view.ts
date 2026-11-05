export interface IProductTagFindView {
  id: string;
  name: string;
}

export interface IProductTagReplaceView {
  outcome: 'replaced' | 'tag-not-found';
  tags: IProductTagFindView[];
  missingTagIds: string[];
}
