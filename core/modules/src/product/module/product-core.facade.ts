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

  public archive(command: IProductCoreArchiveCommand): Promise<IProductCoreArchiveView> {
    return this.productCoreArchive.execute(command);
  }
}
