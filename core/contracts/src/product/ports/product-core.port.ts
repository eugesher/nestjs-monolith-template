import { IProductCoreArchiveCommand, IProductCoreArchiveView } from '../interfaces';

export interface IProductCorePort {
  handleArchive(command: IProductCoreArchiveCommand): Promise<IProductCoreArchiveView>;
}

export const PRODUCT_CORE_PORT = Symbol('PRODUCT_CORE_PORT');
