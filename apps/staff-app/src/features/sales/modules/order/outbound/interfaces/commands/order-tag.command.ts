export interface IOrderTagFindCommand {
  orderId: string;
}

export interface IOrderTagReplaceCommand {
  orderId: string;
  tagIds: string[];
}

export interface IOrderTagFindOrderIdsCommand {
  tagId: string;
}
