import { Injectable } from '@nestjs/common';

import {
  IProductCoreArchiveCommand,
  IProductCoreArchiveView,
  IProductCorePort,
} from '@acme-core/contracts/product';
import { ProductCoreArchiveUseCase } from '../application';

@Injectable()
export class ProductCoreFacade implements IProductCorePort {
  constructor(private readonly productCoreArchive: ProductCoreArchiveUseCase) {}

  public async archive(command: IProductCoreArchiveCommand): Promise<IProductCoreArchiveView> {
    return await this.productCoreArchive.execute(command);
  }
}
