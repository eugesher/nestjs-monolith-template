export interface IProductTagFindCommand {
  productId: string;
}

export interface IProductTagReplaceCommand {
  productId: string;
  tagIds: string[];
}

export interface IProductTagFindProductIdsCommand {
  tagId: string;
}
