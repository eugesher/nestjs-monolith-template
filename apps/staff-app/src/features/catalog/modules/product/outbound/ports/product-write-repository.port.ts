import { Nullable } from '@acme-libs/toolkit';

import { IProductFoundRecord, IProductWriteUpdateCommand } from '../interfaces';

export interface IProductWriteRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductFoundRecord>>;
  update(command: IProductWriteUpdateCommand): Promise<boolean>;
}

export const PRODUCT_WRITE_REPOSITORY_PORT = Symbol('PRODUCT_WRITE_REPOSITORY_PORT');
