import {
  IProductTagFindCommand,
  IProductTagFindProductIdsCommand,
  IProductTagFindView,
  IProductTagReplaceCommand,
  IProductTagReplaceView,
} from '../interfaces';

export interface IProductTagPort {
  find(command: IProductTagFindCommand): Promise<IProductTagFindView[]>;
  replace(command: IProductTagReplaceCommand): Promise<IProductTagReplaceView>;
  findProductIds(command: IProductTagFindProductIdsCommand): Promise<string[]>;
}

export const PRODUCT_TAG_PORT = Symbol('PRODUCT_TAG_PORT');
