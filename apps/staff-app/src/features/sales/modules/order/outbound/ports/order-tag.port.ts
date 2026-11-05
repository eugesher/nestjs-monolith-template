import {
  IOrderTagFindCommand,
  IOrderTagFindOrderIdsCommand,
  IOrderTagFindView,
  IOrderTagReplaceCommand,
  IOrderTagReplaceView,
} from '../interfaces';

export interface IOrderTagPort {
  find(command: IOrderTagFindCommand): Promise<IOrderTagFindView[]>;
  replace(command: IOrderTagReplaceCommand): Promise<IOrderTagReplaceView>;
  findOrderIds(command: IOrderTagFindOrderIdsCommand): Promise<string[]>;
}

export const ORDER_TAG_PORT = Symbol('ORDER_TAG_PORT');
