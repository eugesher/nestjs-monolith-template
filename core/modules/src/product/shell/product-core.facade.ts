import { Injectable } from '@nestjs/common';

import type {
  IProductCoreArchiveCommand,
  IProductCoreArchiveView,
  IProductCorePort,
} from '@acme-core/contracts/product';

import { ProductCoreArchiveUseCase } from '../application';

@Injectable()
export class ProductCoreFacade implements IProductCorePort {
  constructor(private readonly archive: ProductCoreArchiveUseCase) {}

  public async handleArchive(
    command: IProductCoreArchiveCommand,
  ): Promise<IProductCoreArchiveView> {
    return await this.archive.execute(command);
  }
}
